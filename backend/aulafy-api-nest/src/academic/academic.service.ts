import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { JwtPayload } from '../common/auth/jwt-payload.interface'
import { AcademicAccessService } from '../common/access/academic-access.service'
import { RoleName } from '../users/enums/role-name.enum'
import { StudentEntity } from '../academic-structure/entities/student.entity'
import { CourseEntity } from '../courses/entities/course.entity'
import { CourseStudentEntity } from '../courses/entities/course-student.entity'
import { SubjectEntity } from '../courses/entities/subject.entity'
import { Repository } from 'typeorm'
import { CreateEvaluationDto } from './dto/create-evaluation.dto'
import { CreateGradeDto } from './dto/create-grade.dto'
import { EvaluationEntity } from './entities/evaluation.entity'
import { GradeEntity } from './entities/grade.entity'

interface EvaluationResponse {
  id: number
  courseId: number
  courseName: string
  subjectId: number
  subjectName: string
  title: string
  description: string
  type: string
  evaluationDate: string
  weight: number | null
  active: boolean
}

interface GradeResponse {
  id: number
  studentId: number
  studentName: string
  evaluationId: number
  evaluationTitle: string
  subjectName: string
  evaluationDate: string
  score: number
  maxScore: number
  observation: string | null
}

interface AcademicSummaryResponse {
  studentId: number
  studentName: string
  gradeCount: number
  averageScore: number
  status: string
  message: string
}

@Injectable()
export class AcademicService {
  constructor(
    @InjectRepository(EvaluationEntity)
    private readonly evaluationRepository: Repository<EvaluationEntity>,
    @InjectRepository(GradeEntity)
    private readonly gradeRepository: Repository<GradeEntity>,
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    @InjectRepository(SubjectEntity)
    private readonly subjectRepository: Repository<SubjectEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
    @InjectRepository(CourseStudentEntity)
    private readonly courseStudentRepository: Repository<CourseStudentEntity>,
    private readonly accessService: AcademicAccessService
  ) {}

  async findEvaluationsByCourse(courseId: number, user: JwtPayload): Promise<EvaluationResponse[]> {
    await this.accessService.assertCanViewCourse(user, courseId)

    const course = await this.findCourseOrFail(courseId)
    let evaluations = await this.evaluationRepository.find({
      where: { courseId: course.id, active: true },
      order: { evaluationDate: 'DESC', title: 'ASC' }
    })

    if (!evaluations.length) {
      return []
    }

    // SUBJECT_TEACHER solo ve evaluaciones de sus asignaturas propias
    if (user.role === RoleName.PROFESOR) {
      const roleInCourse = await this.accessService.getTeacherRoleInCourse(courseId, user.sub)
      if (roleInCourse !== 'HEAD_TEACHER') {
        const allSubjectIds = [...new Set(evaluations.map((e) => e.subjectId))]
        const ownSubjects = allSubjectIds.length
          ? await this.subjectRepository.find({
              where: allSubjectIds.map((id) => ({ id, teacherId: String(user.sub) }))
            })
          : []
        const ownSubjectIdSet = new Set(ownSubjects.map((s) => s.id))
        evaluations = evaluations.filter((e) => ownSubjectIdSet.has(e.subjectId))
      }
    }

    if (!evaluations.length) {
      return []
    }

    const subjectIds = [...new Set(evaluations.map((evaluation) => evaluation.subjectId))]
    const subjects = await this.subjectRepository.find({
      where: subjectIds.map((id) => ({ id }))
    })
    const subjectsMap = new Map(subjects.map((subject) => [subject.id, subject]))

    return evaluations.map((evaluation) =>
      this.mapEvaluation(evaluation, course, subjectsMap.get(evaluation.subjectId))
    )
  }

  async createEvaluation(request: CreateEvaluationDto, user: JwtPayload): Promise<EvaluationResponse> {
    await this.accessService.assertCanManageCourse(user, request.courseId)

    const course = await this.findCourseOrFail(request.courseId)
    const subject = await this.findSubjectOrFail(request.subjectId)

    if (subject.courseId !== course.id) {
      throw new BadRequestException('La asignatura no pertenece al curso indicado')
    }

    // SUBJECT_TEACHER solo puede crear evaluaciones de sus propias asignaturas
    if (user.role === RoleName.PROFESOR) {
      const roleInCourse = await this.accessService.getTeacherRoleInCourse(request.courseId, user.sub)
      if (roleInCourse !== 'HEAD_TEACHER' && subject.teacherId !== String(user.sub)) {
        throw new ForbiddenException('Solo puedes crear evaluaciones de tus asignaturas asignadas')
      }
    }

    const evaluation = this.evaluationRepository.create({
      courseId: course.id,
      subjectId: subject.id,
      title: request.title.trim(),
      description: request.description.trim(),
      type: request.type,
      evaluationDate: request.evaluationDate,
      weight: request.weight ?? null,
      active: request.active ?? true
    })
    const created = await this.evaluationRepository.save(evaluation)
    return this.mapEvaluation(created, course, subject)
  }

  async findGradesByStudent(studentId: number, user: JwtPayload): Promise<GradeResponse[]> {
    await this.accessService.assertCanViewStudent(user, studentId)
    const student = await this.findStudentOrFail(studentId)

    const grades = await this.gradeRepository.find({
      where: { studentId: student.id },
      order: { createdAt: 'DESC' }
    })
    if (!grades.length) {
      return []
    }

    const evaluations = await this.evaluationRepository.find({
      where: grades.map((grade) => ({ id: grade.evaluationId }))
    })
    const evaluationsMap = new Map(evaluations.map((evaluation) => [evaluation.id, evaluation]))

    const subjects = await this.subjectRepository.find({
      where: [...new Set(evaluations.map((evaluation) => evaluation.subjectId))].map((id) => ({ id }))
    })
    const subjectsMap = new Map(subjects.map((subject) => [subject.id, subject]))

    return grades
      .map((grade) => {
        const evaluation = evaluationsMap.get(grade.evaluationId)
        if (!evaluation) {
          return null
        }
        const subjectName = subjectsMap.get(evaluation.subjectId)?.name ?? 'Asignatura'
        return this.mapGrade(grade, student, evaluation, subjectName)
      })
      .filter((grade): grade is GradeResponse => Boolean(grade))
      .sort((a, b) => b.evaluationDate.localeCompare(a.evaluationDate))
  }

  async createGrade(request: CreateGradeDto, user: JwtPayload): Promise<GradeResponse> {
    const student = await this.findStudentOrFail(request.studentId)
    const evaluation = await this.findEvaluationOrFail(request.evaluationId)

    await this.accessService.assertCanManageStudentRecord(
      user,
      request.studentId,
      Number(evaluation.courseId)
    )

    // SUBJECT_TEACHER solo puede registrar notas de sus propias asignaturas
    if (user.role === RoleName.PROFESOR) {
      const roleInCourse = await this.accessService.getTeacherRoleInCourse(
        Number(evaluation.courseId),
        user.sub
      )
      if (roleInCourse !== 'HEAD_TEACHER') {
        const subject = await this.findSubjectOrFail(Number(evaluation.subjectId))
        if (subject.teacherId !== String(user.sub)) {
          throw new ForbiddenException('Solo puedes registrar notas de tus asignaturas asignadas')
        }
      }
    }

    const studentInCourse = await this.courseStudentRepository.count({
      where: { studentId: student.id, courseId: evaluation.courseId }
    })
    if (studentInCourse === 0) {
      throw new BadRequestException('El alumno no pertenece al curso de la evaluacion')
    }

    const existing = await this.gradeRepository.findOne({
      where: {
        studentId: student.id,
        evaluationId: evaluation.id
      }
    })
    if (existing) {
      throw new ConflictException('Ya existe una nota registrada para esta evaluacion y alumno')
    }

    const grade = this.gradeRepository.create({
      studentId: student.id,
      evaluationId: evaluation.id,
      score: request.score.toFixed(2),
      maxScore: request.maxScore.toFixed(2),
      observation: normalizeOptionalText(request.observation)
    })

    const created = await this.gradeRepository.save(grade)
    const subject = await this.findSubjectOrFail(Number(evaluation.subjectId))
    return this.mapGrade(created, student, evaluation, subject.name)
  }

  async summary(studentId: number, user: JwtPayload): Promise<AcademicSummaryResponse> {
    await this.accessService.assertCanViewStudent(user, studentId)
    const student = await this.findStudentOrFail(studentId)

    const grades = await this.gradeRepository.find({
      where: { studentId: student.id }
    })

    const average = calculateAverage(grades.map((grade) => Number(grade.score)))
    const gradeCount = grades.length

    return {
      studentId: Number(student.id),
      studentName: buildStudentName(student),
      gradeCount,
      averageScore: average,
      status: resolveAcademicStatus(average, gradeCount),
      message: resolveAcademicMessage(gradeCount)
    }
  }

  private mapEvaluation(
    evaluation: EvaluationEntity,
    course: CourseEntity,
    subject?: SubjectEntity
  ): EvaluationResponse {
    return {
      id: Number(evaluation.id),
      courseId: Number(evaluation.courseId),
      courseName: course.name,
      subjectId: Number(evaluation.subjectId),
      subjectName: subject?.name ?? 'Asignatura',
      title: evaluation.title,
      description: evaluation.description,
      type: evaluation.type,
      evaluationDate: evaluation.evaluationDate,
      weight: evaluation.weight,
      active: evaluation.active
    }
  }

  private mapGrade(
    grade: GradeEntity,
    student: StudentEntity,
    evaluation: EvaluationEntity,
    subjectName: string
  ): GradeResponse {
    return {
      id: Number(grade.id),
      studentId: Number(student.id),
      studentName: buildStudentName(student),
      evaluationId: Number(evaluation.id),
      evaluationTitle: evaluation.title,
      subjectName,
      evaluationDate: evaluation.evaluationDate,
      score: Number(grade.score),
      maxScore: Number(grade.maxScore),
      observation: grade.observation
    }
  }

  private async findCourseOrFail(courseId: number): Promise<CourseEntity> {
    const course = await this.courseRepository.findOne({
      where: { id: String(courseId), active: true }
    })
    if (!course) {
      throw new NotFoundException(`Curso ${courseId} no encontrado`)
    }
    return course
  }

  private async findStudentOrFail(studentId: number): Promise<StudentEntity> {
    const student = await this.studentRepository.findOne({
      where: { id: String(studentId), active: true }
    })
    if (!student) {
      throw new NotFoundException(`Alumno ${studentId} no encontrado`)
    }
    return student
  }

  private async findEvaluationOrFail(evaluationId: number): Promise<EvaluationEntity> {
    const evaluation = await this.evaluationRepository.findOne({
      where: { id: String(evaluationId), active: true }
    })
    if (!evaluation) {
      throw new NotFoundException(`Evaluacion ${evaluationId} no encontrada`)
    }
    return evaluation
  }

  private async findSubjectOrFail(subjectId: number): Promise<SubjectEntity> {
    const subject = await this.subjectRepository.findOne({
      where: { id: String(subjectId), active: true }
    })
    if (!subject) {
      throw new NotFoundException(`Asignatura ${subjectId} no encontrada`)
    }
    return subject
  }
}

function buildStudentName(student: StudentEntity): string {
  return `${student.firstName} ${student.lastName}`.trim()
}

function normalizeOptionalText(value?: string): string | null {
  if (!value || !value.trim()) {
    return null
  }
  return value.trim()
}

function calculateAverage(values: number[]): number {
  if (!values.length) {
    return 0
  }
  const total = values.reduce((sum, value) => sum + value, 0)
  return Number((total / values.length).toFixed(2))
}

function resolveAcademicStatus(average: number, gradeCount: number): string {
  if (gradeCount === 0) {
    return 'SIN_DATOS'
  }
  if (average >= 5.5) {
    return 'DESTACADO'
  }
  if (average >= 4) {
    return 'AL_DIA'
  }
  return 'RIESGO'
}

function resolveAcademicMessage(gradeCount: number): string {
  if (gradeCount === 0) {
    return 'Sin evaluaciones registradas'
  }
  if (gradeCount === 1) {
    return 'Promedio parcial basado en 1 evaluacion registrada'
  }
  return `Promedio parcial basado en ${gradeCount} evaluaciones registradas`
}
