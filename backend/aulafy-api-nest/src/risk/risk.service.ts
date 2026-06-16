import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AcademicAccessService } from '../common/access/academic-access.service'
import { JwtPayload } from '../common/auth/jwt-payload.interface'
import { LevelEntity } from '../academic-structure/entities/level.entity'
import { StudentEntity } from '../academic-structure/entities/student.entity'
import { EvaluationEntity } from '../academic/entities/evaluation.entity'
import { GradeEntity } from '../academic/entities/grade.entity'
import { AttendanceEntity } from '../attendance/entities/attendance.entity'
import { CourseEntity } from '../courses/entities/course.entity'
import { CourseStudentEntity } from '../courses/entities/course-student.entity'
import { RoleName } from '../users/enums/role-name.enum'

const MINIMUM_AVERAGE = 4
const MINIMUM_ATTENDANCE_PERCENTAGE = 85

interface RiskStudentResponse {
  studentId: number
  studentName: string
  courseId: number
  courseName: string
  levelName: string
  gradeCount: number
  averageScore: number | null
  attendanceRecords: number
  absentRecords: number
  attendancePercentage: number | null
  riskType: 'ACADEMICO' | 'ASISTENCIA' | 'COMBINADO'
  severity: 'MODERADO' | 'CRITICO'
  reasons: string[]
}

interface RiskReportResponse {
  generatedAt: string
  thresholds: {
    minimumAverage: number
    minimumAttendancePercentage: number
  }
  summary: {
    totalStudents: number
    evaluatedStudents: number
    riskStudents: number
    academicRisk: number
    attendanceRisk: number
    combinedRisk: number
    criticalRisk: number
    moderateRisk: number
  }
  items: RiskStudentResponse[]
}

@Injectable()
export class RiskService {
  constructor(
    @InjectRepository(AttendanceEntity)
    private readonly attendanceRepository: Repository<AttendanceEntity>,
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    @InjectRepository(CourseStudentEntity)
    private readonly courseStudentRepository: Repository<CourseStudentEntity>,
    @InjectRepository(EvaluationEntity)
    private readonly evaluationRepository: Repository<EvaluationEntity>,
    @InjectRepository(GradeEntity)
    private readonly gradeRepository: Repository<GradeEntity>,
    @InjectRepository(LevelEntity)
    private readonly levelRepository: Repository<LevelEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
    private readonly accessService: AcademicAccessService
  ) {}

  async academicRisk(user: JwtPayload): Promise<RiskReportResponse> {
    const courses = await this.findVisibleCourses(user)
    const courseIds = courses.map((course) => Number(course.id))

    if (!courseIds.length) {
      return this.emptyReport(0)
    }

    const courseStudents = await this.courseStudentRepository.find({
      where: courseIds.map((courseId) => ({ courseId: String(courseId) }))
    })
    const studentIds = [...new Set(courseStudents.map((item) => Number(item.studentId)))]

    if (!studentIds.length) {
      return this.emptyReport(0)
    }

    const students = await this.studentRepository.find({
      where: studentIds.map((studentId) => ({ id: String(studentId), active: true })),
      order: { lastName: 'ASC', firstName: 'ASC' }
    })

    const activeStudentIds = students.map((student) => Number(student.id))
    if (!activeStudentIds.length) {
      return this.emptyReport(0)
    }

    const [levels, grades, attendanceRecords] = await Promise.all([
      this.findLevels(students),
      this.findGrades(activeStudentIds),
      this.findAttendance(activeStudentIds, courseIds)
    ])

    const evaluations = await this.findEvaluations(grades)
    const courseById = new Map(courses.map((course) => [Number(course.id), course]))
    const levelById = new Map(levels.map((level) => [Number(level.id), level]))
    const evaluationById = new Map(evaluations.map((evaluation) => [Number(evaluation.id), evaluation]))
    const enrollmentByStudentId = this.buildEnrollmentMap(courseStudents, courseById)
    const gradesByStudentId = this.groupGradesByStudent(grades, evaluationById, courseById)
    const attendanceByStudentId = groupByStudent(attendanceRecords)

    const items = students
      .map((student) =>
        this.mapRiskStudent(
          student,
          enrollmentByStudentId.get(Number(student.id)),
          levelById.get(Number(student.levelId)),
          gradesByStudentId.get(Number(student.id)) ?? [],
          attendanceByStudentId.get(Number(student.id)) ?? []
        )
      )
      .filter((item): item is RiskStudentResponse => Boolean(item))
      .sort((a, b) => compareRiskItems(a, b))

    return {
      generatedAt: new Date().toISOString(),
      thresholds: {
        minimumAverage: MINIMUM_AVERAGE,
        minimumAttendancePercentage: MINIMUM_ATTENDANCE_PERCENTAGE
      },
      summary: {
        totalStudents: students.length,
        evaluatedStudents: students.filter((student) => {
          const id = Number(student.id)
          return (gradesByStudentId.get(id)?.length ?? 0) > 0 || (attendanceByStudentId.get(id)?.length ?? 0) > 0
        }).length,
        riskStudents: items.length,
        academicRisk: items.filter((item) => item.riskType === 'ACADEMICO').length,
        attendanceRisk: items.filter((item) => item.riskType === 'ASISTENCIA').length,
        combinedRisk: items.filter((item) => item.riskType === 'COMBINADO').length,
        criticalRisk: items.filter((item) => item.severity === 'CRITICO').length,
        moderateRisk: items.filter((item) => item.severity === 'MODERADO').length
      },
      items
    }
  }

  private async findVisibleCourses(user: JwtPayload): Promise<CourseEntity[]> {
    if (user.role === RoleName.ADMIN || user.role === RoleName.COLEGIO) {
      return this.courseRepository.find({
        where: { active: true },
        order: { name: 'ASC' }
      })
    }

    const courseIds = await this.accessService.findVisibleCourseIds(user)
    if (!courseIds.length) {
      return []
    }

    return this.courseRepository.find({
      where: courseIds.map((courseId) => ({ id: String(courseId), active: true })),
      order: { name: 'ASC' }
    })
  }

  private async findLevels(students: StudentEntity[]): Promise<LevelEntity[]> {
    const levelIds = [...new Set(students.map((student) => Number(student.levelId)).filter(Boolean))]
    if (!levelIds.length) {
      return []
    }

    return this.levelRepository.find({
      where: levelIds.map((levelId) => ({ id: String(levelId), active: true }))
    })
  }

  private async findGrades(studentIds: number[]): Promise<GradeEntity[]> {
    return this.gradeRepository
      .createQueryBuilder('grade')
      .where('grade.studentId IN (:...studentIds)', { studentIds })
      .getMany()
  }

  private async findEvaluations(grades: GradeEntity[]): Promise<EvaluationEntity[]> {
    const evaluationIds = [...new Set(grades.map((grade) => Number(grade.evaluationId)))]
    if (!evaluationIds.length) {
      return []
    }

    return this.evaluationRepository
      .createQueryBuilder('evaluation')
      .where('evaluation.id IN (:...evaluationIds)', { evaluationIds })
      .andWhere('evaluation.active = :active', { active: true })
      .getMany()
  }

  private async findAttendance(studentIds: number[], courseIds: number[]): Promise<AttendanceEntity[]> {
    return this.attendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.studentId IN (:...studentIds)', { studentIds })
      .andWhere('attendance.courseId IN (:...courseIds)', { courseIds })
      .getMany()
  }

  private buildEnrollmentMap(
    courseStudents: CourseStudentEntity[],
    courseById: Map<number, CourseEntity>
  ): Map<number, CourseEntity> {
    const enrollmentByStudentId = new Map<number, CourseEntity>()

    for (const enrollment of courseStudents) {
      const studentId = Number(enrollment.studentId)
      const course = courseById.get(Number(enrollment.courseId))
      if (course && !enrollmentByStudentId.has(studentId)) {
        enrollmentByStudentId.set(studentId, course)
      }
    }

    return enrollmentByStudentId
  }

  private groupGradesByStudent(
    grades: GradeEntity[],
    evaluationById: Map<number, EvaluationEntity>,
    courseById: Map<number, CourseEntity>
  ): Map<number, GradeEntity[]> {
    const gradesByStudentId = new Map<number, GradeEntity[]>()

    for (const grade of grades) {
      const evaluation = evaluationById.get(Number(grade.evaluationId))
      if (!evaluation || !courseById.has(Number(evaluation.courseId))) {
        continue
      }

      const studentId = Number(grade.studentId)
      const current = gradesByStudentId.get(studentId) ?? []
      current.push(grade)
      gradesByStudentId.set(studentId, current)
    }

    return gradesByStudentId
  }

  private mapRiskStudent(
    student: StudentEntity,
    course: CourseEntity | undefined,
    level: LevelEntity | undefined,
    grades: GradeEntity[],
    attendanceRecords: AttendanceEntity[]
  ): RiskStudentResponse | null {
    if (!course) {
      return null
    }

    const averageScore = grades.length
      ? Number((grades.reduce((sum, grade) => sum + Number(grade.score), 0) / grades.length).toFixed(2))
      : null

    const absentRecords = attendanceRecords.filter((record) => String(record.status) === 'AUSENTE').length
    const attendancePercentage = attendanceRecords.length
      ? Number((((attendanceRecords.length - absentRecords) / attendanceRecords.length) * 100).toFixed(1))
      : null

    const academicRisk = averageScore !== null && averageScore < MINIMUM_AVERAGE
    const attendanceRisk =
      attendancePercentage !== null && attendancePercentage < MINIMUM_ATTENDANCE_PERCENTAGE

    if (!academicRisk && !attendanceRisk) {
      return null
    }

    const riskType = resolveRiskType(academicRisk, attendanceRisk)
    const severity = resolveSeverity(averageScore, attendancePercentage, academicRisk, attendanceRisk)
    const reasons = buildReasons(averageScore, attendancePercentage, attendanceRecords.length)

    return {
      studentId: Number(student.id),
      studentName: `${student.firstName} ${student.lastName}`.trim(),
      courseId: Number(course.id),
      courseName: course.name,
      levelName: level?.name ?? 'Nivel no informado',
      gradeCount: grades.length,
      averageScore,
      attendanceRecords: attendanceRecords.length,
      absentRecords,
      attendancePercentage,
      riskType,
      severity,
      reasons
    }
  }

  private emptyReport(totalStudents: number): RiskReportResponse {
    return {
      generatedAt: new Date().toISOString(),
      thresholds: {
        minimumAverage: MINIMUM_AVERAGE,
        minimumAttendancePercentage: MINIMUM_ATTENDANCE_PERCENTAGE
      },
      summary: {
        totalStudents,
        evaluatedStudents: 0,
        riskStudents: 0,
        academicRisk: 0,
        attendanceRisk: 0,
        combinedRisk: 0,
        criticalRisk: 0,
        moderateRisk: 0
      },
      items: []
    }
  }
}

function groupByStudent(records: AttendanceEntity[]): Map<number, AttendanceEntity[]> {
  const recordsByStudentId = new Map<number, AttendanceEntity[]>()

  for (const record of records) {
    const studentId = Number(record.studentId)
    const current = recordsByStudentId.get(studentId) ?? []
    current.push(record)
    recordsByStudentId.set(studentId, current)
  }

  return recordsByStudentId
}

function resolveRiskType(
  academicRisk: boolean,
  attendanceRisk: boolean
): RiskStudentResponse['riskType'] {
  if (academicRisk && attendanceRisk) {
    return 'COMBINADO'
  }
  return academicRisk ? 'ACADEMICO' : 'ASISTENCIA'
}

function resolveSeverity(
  averageScore: number | null,
  attendancePercentage: number | null,
  academicRisk: boolean,
  attendanceRisk: boolean
): RiskStudentResponse['severity'] {
  if ((academicRisk && attendanceRisk) || (averageScore !== null && averageScore < 3.5)) {
    return 'CRITICO'
  }
  if (attendancePercentage !== null && attendancePercentage < 75) {
    return 'CRITICO'
  }
  return 'MODERADO'
}

function buildReasons(
  averageScore: number | null,
  attendancePercentage: number | null,
  attendanceRecords: number
): string[] {
  const reasons: string[] = []

  if (averageScore !== null && averageScore < MINIMUM_AVERAGE) {
    reasons.push(`Promedio ${averageScore}`)
  }

  if (attendancePercentage !== null && attendancePercentage < MINIMUM_ATTENDANCE_PERCENTAGE) {
    reasons.push(`Asistencia ${attendancePercentage}%`)
  }

  if (attendancePercentage === null && attendanceRecords === 0) {
    reasons.push('Sin asistencia registrada')
  }

  return reasons
}

function compareRiskItems(a: RiskStudentResponse, b: RiskStudentResponse): number {
  if (a.severity !== b.severity) {
    return a.severity === 'CRITICO' ? -1 : 1
  }

  const attendanceA = a.attendancePercentage ?? 100
  const attendanceB = b.attendancePercentage ?? 100
  if (attendanceA !== attendanceB) {
    return attendanceA - attendanceB
  }

  const averageA = a.averageScore ?? 7
  const averageB = b.averageScore ?? 7
  return averageA - averageB
}
