import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { StudentEntity } from '../academic-structure/entities/student.entity'
import { AcademicAccessService } from '../common/access/academic-access.service'
import { JwtPayload } from '../common/auth/jwt-payload.interface'
import { CourseEntity } from '../courses/entities/course.entity'
import { CourseStudentEntity } from '../courses/entities/course-student.entity'
import { CourseTeacherEntity } from '../courses/entities/course-teacher.entity'
import { NotificationsService } from '../notifications/notifications.service'
import { RoleName } from '../users/enums/role-name.enum'
import { UserEntity } from '../users/entities/user.entity'
import { CreateChatMessageDto } from './dto/create-chat-message.dto'
import { CreateChatRoomDto } from './dto/create-chat-room.dto'
import { ChatMessageEntity } from './entities/chat-message.entity'
import { ChatRoomEntity } from './entities/chat-room.entity'

interface ChatRoomResponse {
  id: number
  courseId: number
  courseName: string
  name: string
  createdAt: string
  latestMessage: string | null
  latestMessageAt: string | null
}

interface ChatMessageResponse {
  id: number
  roomId: number
  authorId: number
  authorName: string
  content: string
  createdAt: string
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoomEntity)
    private readonly roomRepository: Repository<ChatRoomEntity>,
    @InjectRepository(ChatMessageEntity)
    private readonly messageRepository: Repository<ChatMessageEntity>,
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CourseTeacherEntity)
    private readonly courseTeacherRepository: Repository<CourseTeacherEntity>,
    @InjectRepository(CourseStudentEntity)
    private readonly courseStudentRepository: Repository<CourseStudentEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
    private readonly accessService: AcademicAccessService,
    private readonly notificationsService: NotificationsService
  ) {}

  async listRooms(user: JwtPayload): Promise<ChatRoomResponse[]> {
    const rooms = await this.findVisibleRooms(user)
    if (!rooms.length) {
      return []
    }

    const courseMap = await this.findCoursesMap(rooms.map((room) => Number(room.courseId)))
    const latestByRoom = await this.findLatestMessageByRoom(rooms.map((room) => Number(room.id)))

    return rooms.map((room) => this.mapRoom(room, courseMap.get(Number(room.courseId)), latestByRoom.get(Number(room.id))))
  }

  async createRoom(request: CreateChatRoomDto, user: JwtPayload): Promise<ChatRoomResponse> {
    await this.assertCanCreateChatRoom(user, request.courseId)
    const course = await this.findCourseOrFail(request.courseId)

    const normalizedName = request.name.trim()
    if (!normalizedName) {
      throw new BadRequestException('El nombre de la sala es obligatorio')
    }
    const duplicate = await this.roomRepository
      .createQueryBuilder('room')
      .where('room.courseId = :courseId', { courseId: String(request.courseId) })
      .andWhere('LOWER(room.name) = LOWER(:name)', { name: normalizedName })
      .andWhere('room.active = :active', { active: true })
      .getOne()
    if (duplicate) {
      throw new ConflictException('Ya existe una sala activa con ese nombre para este curso')
    }

    const room = this.roomRepository.create({
      courseId: String(request.courseId),
      name: normalizedName,
      createdById: String(user.sub),
      active: true
    })
    const created = await this.roomRepository.save(room)
    return this.mapRoom(created, course, null)
  }

  async archiveRoom(roomId: number, user: JwtPayload): Promise<{ id: number; archived: boolean }> {
    const room = await this.findRoomOrFail(roomId)
    await this.assertCanArchiveChatRoom(user, Number(room.courseId))
    room.active = false
    await this.roomRepository.save(room)
    return { id: Number(room.id), archived: true }
  }

  async findMessagesByRoom(roomId: number, user: JwtPayload): Promise<ChatMessageResponse[]> {
    const room = await this.findRoomOrFail(roomId)
    await this.assertCanUseCourseChat(user, Number(room.courseId))

    const messages = await this.messageRepository.find({
      where: {
        roomId: room.id,
        active: true
      },
      order: {
        createdAt: 'ASC'
      }
    })
    if (!messages.length) {
      return []
    }

    const authors = await this.userRepository.find({
      where: [...new Set(messages.map((message) => message.authorId))].map((id) => ({ id }))
    })
    const authorsMap = new Map(authors.map((author) => [author.id, author]))

    return messages.map((message) => this.mapMessage(message, authorsMap.get(message.authorId)))
  }

  async createMessage(
    roomId: number,
    request: CreateChatMessageDto,
    user: JwtPayload
  ): Promise<ChatMessageResponse> {
    const room = await this.findRoomOrFail(roomId)
    await this.assertCanUseCourseChat(user, Number(room.courseId))
    const author = await this.findUserOrFail(user.sub)

    const message = this.messageRepository.create({
      roomId: room.id,
      authorId: String(user.sub),
      content: request.content.trim(),
      active: true
    })
    const created = await this.messageRepository.save(message)

    const course = await this.findCourseOrFail(Number(room.courseId))
    await this.notifyRoomParticipants(course, room, author, created.content)

    return this.mapMessage(created, author)
  }

  private async assertCanArchiveChatRoom(user: JwtPayload, courseId: number): Promise<void> {
    if (user.role === RoleName.PROFESOR) {
      await this.accessService.assertTeacherCourseRole(user, courseId, ['HEAD_TEACHER'])
      return
    }
    throw new ForbiddenException('No tienes permiso para eliminar salas de chat')
  }

  private async assertCanCreateChatRoom(user: JwtPayload, courseId: number): Promise<void> {
    if (user.role === RoleName.PROFESOR) {
      await this.accessService.assertTeacherCourseRole(user, courseId, ['HEAD_TEACHER'])
      return
    }
    throw new ForbiddenException('No tienes permiso para crear salas de chat')
  }

  private async assertCanUseCourseChat(user: JwtPayload, courseId: number): Promise<void> {
    if (user.role === RoleName.ADMIN || user.role === RoleName.COLEGIO) {
      return
    }
    if (user.role === RoleName.PROFESOR) {
      await this.accessService.assertTeacherCourseRole(user, courseId, ['HEAD_TEACHER'])
      return
    }
    await this.accessService.assertCanViewCourse(user, courseId)
  }

  private async findVisibleRooms(user: JwtPayload): Promise<ChatRoomEntity[]> {
    if (user.role === RoleName.ADMIN || user.role === RoleName.COLEGIO) {
      return this.roomRepository.find({
        where: { active: true },
        order: { createdAt: 'DESC' }
      })
    }

    // PROFESOR: solo salas de cursos donde es HEAD_TEACHER
    const visibleCourseIds = user.role === RoleName.PROFESOR
      ? await this.accessService.findHeadTeacherCourseIds(user.sub)
      : await this.accessService.findVisibleCourseIds(user)
    if (!visibleCourseIds.length) {
      return []
    }

    return this.roomRepository.find({
      where: visibleCourseIds.map((courseId) => ({
        courseId: String(courseId),
        active: true
      })),
      order: { createdAt: 'DESC' }
    })
  }

  private async findLatestMessageByRoom(roomIds: number[]): Promise<Map<number, ChatMessageEntity>> {
    if (!roomIds.length) {
      return new Map<number, ChatMessageEntity>()
    }

    const messages = await this.messageRepository.find({
      where: roomIds.map((roomId) => ({
        roomId: String(roomId),
        active: true
      })),
      order: {
        createdAt: 'DESC'
      }
    })

    const latestMap = new Map<number, ChatMessageEntity>()
    messages.forEach((message) => {
      const key = Number(message.roomId)
      if (!latestMap.has(key)) {
        latestMap.set(key, message)
      }
    })
    return latestMap
  }

  private async findCoursesMap(courseIds: number[]): Promise<Map<number, CourseEntity>> {
    const uniqueIds = [...new Set(courseIds)]
    if (!uniqueIds.length) {
      return new Map<number, CourseEntity>()
    }

    const courses = await this.courseRepository.find({
      where: uniqueIds.map((id) => ({ id: String(id) }))
    })
    return new Map(courses.map((course) => [Number(course.id), course]))
  }

  private mapRoom(
    room: ChatRoomEntity,
    course?: CourseEntity,
    latestMessage?: ChatMessageEntity | null
  ): ChatRoomResponse {
    const createdAt = room.createdAt instanceof Date ? room.createdAt : new Date()
    const latestAt = latestMessage?.createdAt instanceof Date ? latestMessage.createdAt : null
    return {
      id: Number(room.id),
      courseId: Number(room.courseId),
      courseName: course?.name ?? 'Curso',
      name: room.name,
      createdAt: createdAt.toISOString(),
      latestMessage: latestMessage?.content ?? null,
      latestMessageAt: latestAt ? latestAt.toISOString() : null
    }
  }

  private mapMessage(message: ChatMessageEntity, author?: UserEntity): ChatMessageResponse {
    const createdAt = message.createdAt instanceof Date ? message.createdAt : new Date()
    return {
      id: Number(message.id),
      roomId: Number(message.roomId),
      authorId: Number(message.authorId),
      authorName: author?.fullName ?? 'Usuario',
      content: message.content,
      createdAt: createdAt.toISOString()
    }
  }

  private async notifyRoomParticipants(course: CourseEntity, room: ChatRoomEntity, author: UserEntity, content: string): Promise<void> {
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

    const targetUserIds = new Set<string>()
    teacherLinks
      .filter((link) => link.roleInCourse === 'HEAD_TEACHER')
      .forEach((link) => targetUserIds.add(link.teacherId))
    students.forEach((student) => {
      if (student.studentUserId) {
        targetUserIds.add(student.studentUserId)
      }
      if (student.guardianId) {
        targetUserIds.add(student.guardianId)
      }
    })
    targetUserIds.delete(author.id)

    const ids = [...targetUserIds]
    if (!ids.length) {
      return
    }

    const users = await this.userRepository.find({
      where: ids.map((id) => ({ id, active: true }))
    })
    const chatIds = [...new Set(users.map((record) => record.telegramChatId?.trim()).filter(Boolean) as string[])]
    if (!chatIds.length) {
      return
    }

    const message = [
      `Aulafy | Nuevo mensaje en ${course.name}`,
      `Sala: ${room.name}`,
      `De: ${author.fullName}`,
      `Mensaje: ${content}`
    ].join('\n')

    await Promise.all(
      chatIds.map((chatId) =>
        this.notificationsService.sendTypedMessage(
          Number(author.id),
          'TELEGRAM_CHAT_MESSAGE',
          message,
          chatId
        )
      )
    )
  }

  private async findRoomOrFail(roomId: number): Promise<ChatRoomEntity> {
    const room = await this.roomRepository.findOne({
      where: {
        id: String(roomId),
        active: true
      }
    })
    if (!room) {
      throw new NotFoundException(`Sala de chat ${roomId} no encontrada`)
    }
    return room
  }

  private async findCourseOrFail(courseId: number): Promise<CourseEntity> {
    const course = await this.courseRepository.findOne({
      where: {
        id: String(courseId),
        active: true
      }
    })
    if (!course) {
      throw new NotFoundException(`Curso ${courseId} no encontrado`)
    }
    return course
  }

  private async findUserOrFail(userId: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        id: String(userId),
        active: true
      }
    })
    if (!user) {
      throw new NotFoundException(`Usuario ${userId} no encontrado`)
    }
    return user
  }
}
