import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { JwtPayload } from '../common/auth/jwt-payload.interface'
import { AcademicAccessService } from '../common/access/academic-access.service'
import { StudentEntity } from '../academic-structure/entities/student.entity'
import { CourseEntity } from '../courses/entities/course.entity'
import { CourseStudentEntity } from '../courses/entities/course-student.entity'
import { Repository } from 'typeorm'
import { CreateAttendanceDto } from './dto/create-attendance.dto'
import { AttendanceEntity } from './entities/attendance.entity'
import { AttendanceStatus } from './enums/attendance-status.enum'

interface AttendanceResponse {
  id: number
  studentId: number
  studentName: string
  courseId: number
  courseName: string
  date: string
  status: AttendanceStatus
  comment: string | null
}

interface AttendanceSummaryResponse {
  studentId: number
  studentName: string
  totalRecords: number
  presentRecords: number
  absentRecords: number
  justifiedRecords: number
  lateRecords: number
  attendancePercentage: number
  status: string
}

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceEntity)
    private readonly attendanceRepository: Repository<AttendanceEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    @InjectRepository(CourseStudentEntity)
    private readonly courseStudentRepository: Repository<CourseStudentEntity>,
    private readonly accessService: AcademicAccessService
  ) {}

  async findByStudent(studentId: number, user: JwtPayload): Promise<AttendanceResponse[]> {
    await this.accessService.assertCanViewStudent(user, studentId)
    const student = await this.findStudentOrFail(studentId)

    const records = await this.attendanceRepository.find({
      where: { studentId: student.id },
      order: { date: 'DESC' }
    })
    if (!records.length) {
      return []
    }

    const courses = await this.courseRepository.find({
      where: [...new Set(records.map((record) => record.courseId))].map((id) => ({ id }))
    })
    const coursesMap = new Map(courses.map((course) => [course.id, course]))

    return records.map((record) => ({
      id: Number(record.id),
      studentId: Number(record.studentId),
      studentName: buildStudentName(student),
      courseId: Number(record.courseId),
      courseName: coursesMap.get(record.courseId)?.name ?? 'Curso',
      date: record.date,
      status: record.status,
      comment: record.comment
    }))
  }

  async create(request: CreateAttendanceDto, user: JwtPayload): Promise<AttendanceResponse> {
    const student = await this.findStudentOrFail(request.studentId)
    const course = await this.findCourseOrFail(request.courseId)

    await this.accessService.assertCanManageStudentRecord(user, request.studentId, request.courseId)

    const linkCount = await this.courseStudentRepository.count({
      where: { courseId: course.id, studentId: student.id }
    })
    if (linkCount === 0) {
      throw new BadRequestException('El alumno no pertenece al curso seleccionado')
    }

    const existing = await this.attendanceRepository.findOne({
      where: {
        studentId: student.id,
        courseId: course.id,
        date: request.date
      }
    })

    const normalizedComment = normalizeOptionalText(request.comment)

    const attendance = existing
      ? Object.assign(existing, { status: request.status, comment: normalizedComment })
      : this.attendanceRepository.create({
          studentId: student.id,
          courseId: course.id,
          date: request.date,
          status: request.status,
          comment: normalizedComment
        })

    const saved = await this.attendanceRepository.save(attendance)
    return {
      id: Number(saved.id),
      studentId: Number(saved.studentId),
      studentName: buildStudentName(student),
      courseId: Number(saved.courseId),
      courseName: course.name,
      date: saved.date,
      status: saved.status,
      comment: saved.comment
    }
  }

  async summary(studentId: number, user: JwtPayload): Promise<AttendanceSummaryResponse> {
    await this.accessService.assertCanViewStudent(user, studentId)
    const student = await this.findStudentOrFail(studentId)

    const records = await this.attendanceRepository.find({
      where: { studentId: student.id }
    })

    const presentRecords = countByStatus(records, AttendanceStatus.PRESENTE)
    const absentRecords = countByStatus(records, AttendanceStatus.AUSENTE)
    const justifiedRecords = countByStatus(records, AttendanceStatus.JUSTIFICADO)
    const lateRecords = countByStatus(records, AttendanceStatus.ATRASADO)
    const attendancePercentage = calculateAttendancePercentage(records)

    return {
      studentId: Number(student.id),
      studentName: buildStudentName(student),
      totalRecords: records.length,
      presentRecords,
      absentRecords,
      justifiedRecords,
      lateRecords,
      attendancePercentage,
      status: attendancePercentage >= 85 ? 'AL_DIA' : 'RIESGO'
    }
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

  private async findCourseOrFail(courseId: number): Promise<CourseEntity> {
    const course = await this.courseRepository.findOne({
      where: { id: String(courseId), active: true }
    })
    if (!course) {
      throw new NotFoundException(`Curso ${courseId} no encontrado`)
    }
    return course
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

function countByStatus(records: AttendanceEntity[], status: AttendanceStatus): number {
  return records.filter((record) => record.status === status).length
}

function calculateAttendancePercentage(records: AttendanceEntity[]): number {
  if (!records.length) {
    return 0
  }
  const attended = records.filter(
    (record) => record.status === AttendanceStatus.PRESENTE || record.status === AttendanceStatus.ATRASADO
  ).length
  return Number(((attended / records.length) * 100).toFixed(2))
}
