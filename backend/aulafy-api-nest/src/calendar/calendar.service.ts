import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { StudentEntity } from '../academic-structure/entities/student.entity'
import { JwtPayload } from '../common/auth/jwt-payload.interface'
import { AcademicAccessService } from '../common/access/academic-access.service'
import { CourseEntity } from '../courses/entities/course.entity'
import { CourseStudentEntity } from '../courses/entities/course-student.entity'
import { CourseTeacherEntity } from '../courses/entities/course-teacher.entity'
import { NotificationsService } from '../notifications/notifications.service'
import { UserEntity } from '../users/entities/user.entity'
import { RoleName } from '../users/enums/role-name.enum'
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto'
import { CalendarEventEntity } from './entities/calendar-event.entity'

const GENERAL_EVENT_TYPES: string[] = ['REUNION', 'ACTIVIDAD', 'COMUNICADO']

interface CalendarEventResponse {
  id: number
  courseId: number
  courseName: string
  createdByName: string
  title: string
  description: string
  type: string
  startAt: string
  endAt: string | null
  notifyTelegram: boolean
}

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(CalendarEventEntity)
    private readonly eventRepository: Repository<CalendarEventEntity>,
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CourseStudentEntity)
    private readonly courseStudentRepository: Repository<CourseStudentEntity>,
    @InjectRepository(CourseTeacherEntity)
    private readonly courseTeacherRepository: Repository<CourseTeacherEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
    private readonly accessService: AcademicAccessService,
    private readonly notificationsService: NotificationsService
  ) {}

  async findByCourse(courseId: number, user: JwtPayload): Promise<CalendarEventResponse[]> {
    await this.accessService.assertCanViewCourse(user, courseId)
    const course = await this.findCourseOrFail(courseId)

    const events = await this.eventRepository.find({
      where: { courseId: course.id, active: true },
      order: { startAt: 'ASC' }
    })
    if (!events.length) {
      return []
    }

    const users = await this.userRepository.find({
      where: [...new Set(events.map((event) => event.createdById))].map((id) => ({ id }))
    })
    const usersMap = new Map(users.map((record) => [record.id, record]))

    return events.map((event) => this.mapEvent(event, course, usersMap.get(event.createdById)))
  }

  async create(courseId: number, request: CreateCalendarEventDto, user: JwtPayload): Promise<CalendarEventResponse> {
    await this.accessService.assertCanManageCourse(user, courseId)
    if (GENERAL_EVENT_TYPES.includes(request.type) && user.role === RoleName.PROFESOR) {
      await this.accessService.assertTeacherCourseRole(user, courseId, ['HEAD_TEACHER'])
    }
    const course = await this.findCourseOrFail(courseId)
    const author = await this.findUserOrFail(user.sub)

    const startAt = new Date(request.startAt)
    const endAt = request.endAt ? new Date(request.endAt) : null
    if (Number.isNaN(startAt.getTime())) {
      throw new BadRequestException('Fecha de inicio inválida')
    }
    if (endAt && Number.isNaN(endAt.getTime())) {
      throw new BadRequestException('Fecha de término inválida')
    }
    if (endAt && endAt < startAt) {
      throw new BadRequestException('La fecha de término no puede ser anterior al inicio')
    }

    const event = this.eventRepository.create({
      courseId: course.id,
      createdById: String(user.sub),
      title: request.title.trim(),
      description: request.description.trim(),
      type: request.type,
      startAt,
      endAt,
      notifyTelegram: request.notifyTelegram,
      active: true
    })
    const created = await this.eventRepository.save(event)

    if (created.notifyTelegram) {
      await this.notifyCourseParticipants(course, created, user.sub)
    }

    return this.mapEvent(created, course, author)
  }

  private async notifyCourseParticipants(
    course: CourseEntity,
    event: CalendarEventEntity,
    actorUserId: number
  ): Promise<void> {
    // Se arma el universo de destinatarios del curso desde sus relaciones academicas.
    const teacherLinks = await this.courseTeacherRepository.find({
      where: { courseId: course.id }
    })
    const studentLinks = await this.courseStudentRepository.find({
      where: { courseId: course.id }
    })

    const studentIds = [...new Set(studentLinks.map((link) => link.studentId))]
    const students = studentIds.length
      ? await this.studentRepository.find({
          where: studentIds.map((id) => ({ id }))
        })
      : []

    const candidateUserIds = new Set<string>()
    teacherLinks.forEach((link) => candidateUserIds.add(link.teacherId))
    students.forEach((student) => {
      if (student.studentUserId) {
        candidateUserIds.add(student.studentUserId)
      }
      if (student.guardianId) {
        candidateUserIds.add(student.guardianId)
      }
    })
    candidateUserIds.delete(String(actorUserId))

    const userIds = [...candidateUserIds]
    if (!userIds.length) {
      return
    }

    const users = await this.userRepository.find({
      where: userIds.map((id) => ({ id, active: true }))
    })
    // Solo se intentan envios a usuarios con chat Telegram configurado.
    const chatIds = [...new Set(users.map((item) => item.telegramChatId?.trim()).filter(Boolean) as string[])]
    if (!chatIds.length) {
      return
    }

    const message = this.buildCalendarNotificationMessage(course, event)
    await Promise.all(
      chatIds.map((chatId) =>
        this.notificationsService.sendTypedMessage(
          actorUserId,
          'TELEGRAM_CALENDAR_EVENT',
          message,
          chatId
        )
      )
    )
  }

  private buildCalendarNotificationMessage(course: CourseEntity, event: CalendarEventEntity): string {
    const startAt = this.formatDate(event.startAt)
    const endAt = event.endAt ? this.formatDate(event.endAt) : 'Sin hora de termino'
    return [
      `Aulafy | Nuevo evento en ${course.name}`,
      `Titulo: ${event.title}`,
      `Tipo: ${event.type}`,
      `Inicio: ${startAt}`,
      `Termino: ${endAt}`,
      `Descripcion: ${event.description}`
    ].join('\n')
  }

  private formatDate(date: Date): string {
    return date.toISOString().replace('T', ' ').slice(0, 16)
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

  private mapEvent(
    event: CalendarEventEntity,
    course: CourseEntity,
    creator?: UserEntity
  ): CalendarEventResponse {
    return {
      id: Number(event.id),
      courseId: Number(event.courseId),
      courseName: course.name,
      createdByName: creator?.fullName ?? 'Usuario',
      title: event.title,
      description: event.description,
      type: event.type,
      startAt: event.startAt.toISOString(),
      endAt: event.endAt ? event.endAt.toISOString() : null,
      notifyTelegram: event.notifyTelegram
    }
  }
}
