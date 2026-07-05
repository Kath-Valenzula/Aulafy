import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, Repository } from 'typeorm'
import { StudentEntity } from '../academic-structure/entities/student.entity'
import { JwtPayload } from '../common/auth/jwt-payload.interface'
import { AcademicAccessService } from '../common/access/academic-access.service'
import { CourseEntity } from '../courses/entities/course.entity'
import { CourseStudentEntity } from '../courses/entities/course-student.entity'
import { NotificationsService } from '../notifications/notifications.service'
import { UserEntity } from '../users/entities/user.entity'
import { RoleName } from '../users/enums/role-name.enum'
import { AnnotationsQueryDto } from './dto/annotations-query.dto'
import { CreateAnnotationDto } from './dto/create-annotation.dto'
import { StudentAnnotationEntity } from './entities/student-annotation.entity'
import { AnnotationStatus } from './enums/annotation-status.enum'
import { AnnotationType } from './enums/annotation-type.enum'

interface AnnotationResponse {
  id: number
  studentId: number
  studentName: string
  courseId: number
  courseName: string
  createdById: number
  createdByName: string
  type: string
  severity: string
  status: string
  title: string
  description: string
  createdAt: string
}

@Injectable()
export class AnnotationsService {
  constructor(
    @InjectRepository(StudentAnnotationEntity)
    private readonly annotationRepository: Repository<StudentAnnotationEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    @InjectRepository(CourseStudentEntity)
    private readonly courseStudentRepository: Repository<CourseStudentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly accessService: AcademicAccessService,
    private readonly notificationsService: NotificationsService
  ) {}

  async list(query: AnnotationsQueryDto, user: JwtPayload): Promise<AnnotationResponse[]> {
    const where = await this.buildListWhere(query, user)
    if (!where.length) {
      return []
    }

    const annotations = await this.annotationRepository.find({
      where,
      order: { createdAt: 'DESC' }
    })
    if (!annotations.length) {
      return []
    }

    return this.mapAnnotations(annotations)
  }

  async findByStudent(studentId: number, user: JwtPayload): Promise<AnnotationResponse[]> {
    await this.accessService.assertCanViewStudent(user, studentId)
    const annotations = await this.annotationRepository.find({
      where: { studentId: String(studentId), active: true },
      order: { createdAt: 'DESC' }
    })
    if (!annotations.length) {
      return []
    }
    return this.mapAnnotations(annotations)
  }

  async create(request: CreateAnnotationDto, user: JwtPayload): Promise<AnnotationResponse> {
    const student = await this.findStudentOrFail(request.studentId)
    const course = await this.findCourseOrFail(request.courseId)
    await this.accessService.assertCanManageStudentRecord(user, request.studentId, request.courseId)
    if (request.type === AnnotationType.CONDUCTUAL && user.role === RoleName.PROFESOR) {
      await this.accessService.assertTeacherCourseRole(user, request.courseId, ['HEAD_TEACHER'])
    }

    const linkCount = await this.courseStudentRepository.count({
      where: {
        courseId: String(request.courseId),
        studentId: String(request.studentId)
      }
    })
    if (linkCount === 0) {
      throw new BadRequestException('El alumno no pertenece al curso seleccionado')
    }

    const annotation = this.annotationRepository.create({
      studentId: student.id,
      courseId: course.id,
      createdById: String(user.sub),
      type: request.type,
      severity: request.severity,
      status: AnnotationStatus.PENDIENTE,
      title: request.title.trim(),
      description: request.description.trim(),
      active: true
    })
    const created = await this.annotationRepository.save(annotation)
    const createdBy = await this.findUserOrFail(user.sub)
    await this.notifyStudentStakeholders(course, student, created, user.sub)
    return this.mapAnnotation(created, student, course, createdBy)
  }

  private async notifyStudentStakeholders(
    course: CourseEntity,
    student: StudentEntity,
    annotation: StudentAnnotationEntity,
    actorUserId: number
  ): Promise<void> {
    // Se notifica solo a los actores directos de la anotacion: alumno y apoderado.
    const targetUserIds = new Set<string>()
    if (student.studentUserId) {
      targetUserIds.add(student.studentUserId)
    }
    if (student.guardianId) {
      targetUserIds.add(student.guardianId)
    }
    targetUserIds.delete(String(actorUserId))

    const ids = [...targetUserIds]
    if (!ids.length) {
      return
    }

    const users = await this.userRepository.find({
      where: ids.map((id) => ({ id, active: true }))
    })
    // El envio se limita a usuarios con chat Telegram definido.
    const chatIds = [...new Set(users.map((item) => item.telegramChatId?.trim()).filter(Boolean) as string[])]
    if (!chatIds.length) {
      return
    }

    const message = this.buildAnnotationNotificationMessage(course, student, annotation)
    await Promise.all(
      chatIds.map((chatId) =>
        this.notificationsService.sendTypedMessage(
          actorUserId,
          'TELEGRAM_ANNOTATION',
          message,
          chatId
        )
      )
    )
  }

  private buildAnnotationNotificationMessage(
    course: CourseEntity,
    student: StudentEntity,
    annotation: StudentAnnotationEntity
  ): string {
    const fullName = `${student.firstName} ${student.lastName}`.trim()
    return [
      `Aulafy | Nueva anotacion para ${fullName}`,
      `Curso: ${course.name}`,
      `Tipo: ${annotation.type}`,
      `Severidad: ${annotation.severity}`,
      `Titulo: ${annotation.title}`,
      `Descripcion: ${annotation.description}`
    ].join('\n')
  }

  private async buildListWhere(
    query: AnnotationsQueryDto,
    user: JwtPayload
  ): Promise<FindOptionsWhere<StudentAnnotationEntity>[]> {
    const base: FindOptionsWhere<StudentAnnotationEntity> = { active: true }

    if (query.courseId) {
      await this.accessService.assertCanViewCourse(user, query.courseId)
      base.courseId = String(query.courseId)
    }

    if (query.studentId) {
      await this.accessService.assertCanViewStudent(user, query.studentId)
      base.studentId = String(query.studentId)
    }

    if (query.courseId || query.studentId || user.role === RoleName.ADMIN || user.role === RoleName.COLEGIO) {
      return [base]
    }

    if (user.role === RoleName.PROFESOR) {
      const courseIds = await this.accessService.findVisibleCourseIds(user)
      return courseIds.map((courseId) => ({
        ...base,
        courseId: String(courseId)
      }))
    }

    const studentIds = await this.accessService.findVisibleStudentIds(user)
    return studentIds.map((studentId) => ({
      ...base,
      studentId: String(studentId)
    }))
  }

  private async mapAnnotations(annotations: StudentAnnotationEntity[]): Promise<AnnotationResponse[]> {
    const students = await this.studentRepository.find({
      where: [...new Set(annotations.map((row) => row.studentId))].map((id) => ({ id }))
    })
    const courses = await this.courseRepository.find({
      where: [...new Set(annotations.map((row) => row.courseId))].map((id) => ({ id }))
    })
    const users = await this.userRepository.find({
      where: [...new Set(annotations.map((row) => row.createdById))].map((id) => ({ id }))
    })

    const studentsMap = new Map(students.map((row) => [row.id, row]))
    const coursesMap = new Map(courses.map((row) => [row.id, row]))
    const usersMap = new Map(users.map((row) => [row.id, row]))

    return annotations.map((annotation) =>
      this.mapAnnotation(
        annotation,
        studentsMap.get(annotation.studentId),
        coursesMap.get(annotation.courseId),
        usersMap.get(annotation.createdById)
      )
    )
  }

  private mapAnnotation(
    annotation: StudentAnnotationEntity,
    student?: StudentEntity,
    course?: CourseEntity,
    createdBy?: UserEntity
  ): AnnotationResponse {
    const createdAt = annotation.createdAt instanceof Date ? annotation.createdAt : new Date()

    return {
      id: Number(annotation.id),
      studentId: Number(annotation.studentId),
      studentName: student ? `${student.firstName} ${student.lastName}`.trim() : 'Alumno',
      courseId: Number(annotation.courseId),
      courseName: course?.name ?? 'Curso',
      createdById: Number(annotation.createdById),
      createdByName: createdBy?.fullName ?? 'Usuario',
      type: annotation.type,
      severity: annotation.severity,
      status: annotation.status,
      title: annotation.title,
      description: annotation.description,
      createdAt: createdAt.toISOString()
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

  private async findUserOrFail(userId: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id: String(userId) }
    })
    if (!user) {
      throw new NotFoundException(`Usuario ${userId} no encontrado`)
    }
    return user
  }
}
