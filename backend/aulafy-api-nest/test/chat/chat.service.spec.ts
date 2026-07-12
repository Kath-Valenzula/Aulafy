import { ForbiddenException } from '@nestjs/common'
import { ChatService } from '../../src/chat/chat.service'
import { RoleName } from '../../src/users/enums/role-name.enum'

function roomFixture(overrides: Record<string, any> = {}): any {
  return {
    id: '1',
    courseId: '1',
    name: 'Chat 6 Basico B',
    createdById: '3',
    active: true,
    createdAt: new Date('2026-06-01T10:00:00Z'),
    ...overrides
  }
}

function courseFixture(overrides: Record<string, any> = {}): any {
  return { id: '1', name: '6 Basico B', active: true, ...overrides }
}

function messageFixture(overrides: Record<string, any> = {}): any {
  return {
    id: '1',
    roomId: '1',
    authorId: '3',
    content: 'Mensaje de prueba',
    active: true,
    createdAt: new Date('2026-06-01T10:05:00Z'),
    ...overrides
  }
}

function userFixture(overrides: Record<string, any> = {}): any {
  return {
    id: '3',
    fullName: 'Profesor Demo',
    email: 'profesor@aulafy.cl',
    active: true,
    telegramChatId: null,
    ...overrides
  }
}

function buildChatService(options: {
  findVisibleCourseIds?: jest.Mock
  findHeadTeacherCourseIds?: jest.Mock
  assertCanViewCourse?: jest.Mock
  assertCanManageCourse?: jest.Mock
  assertTeacherCourseRole?: jest.Mock
  courseTeacherLinks?: any[]
  userFindMany?: jest.Mock
  userFindOne?: jest.Mock
  availableUsers?: any[]
} = {}) {
  const roomRepository = {
    find: jest.fn().mockResolvedValue([roomFixture()]),
    findOne: jest.fn().mockResolvedValue(roomFixture()),
    create: jest.fn().mockImplementation((data: any) => ({ ...messageFixture(), ...data })),
    save: jest.fn().mockImplementation((entity: any) => Promise.resolve(entity))
  }
  const messageRepository = {
    find: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockImplementation((data: any) => ({ ...messageFixture(), ...data })),
    save: jest.fn().mockImplementation((entity: any) => Promise.resolve(entity))
  }
  const courseRepository = {
    find: jest.fn().mockResolvedValue([courseFixture()]),
    findOne: jest.fn().mockResolvedValue(courseFixture())
  }
  const userFindMock = options.availableUsers
    ? jest.fn().mockImplementation((query: any) => {
        const ids: string[] = (query?.where ?? []).map((w: any) => w.id)
        return Promise.resolve(options.availableUsers!.filter((u) => ids.includes(u.id)))
      })
    : (options.userFindMany ?? jest.fn().mockResolvedValue([]))
  const userRepository = {
    find: userFindMock,
    findOne: options.userFindOne ?? jest.fn().mockResolvedValue(userFixture())
  }
  const courseTeacherRepository = {
    find: jest.fn().mockResolvedValue(options.courseTeacherLinks ?? [])
  }
  const courseStudentRepository = { find: jest.fn().mockResolvedValue([]) }
  const studentRepository = { find: jest.fn().mockResolvedValue([]) }
  const notificationsService = { sendTypedMessage: jest.fn().mockResolvedValue(undefined) }

  const accessService = {
    findVisibleCourseIds: options.findVisibleCourseIds ?? jest.fn().mockResolvedValue([1]),
    findHeadTeacherCourseIds: options.findHeadTeacherCourseIds ?? jest.fn().mockResolvedValue([1]),
    assertCanViewCourse: options.assertCanViewCourse ?? jest.fn().mockResolvedValue(undefined),
    assertCanManageCourse: options.assertCanManageCourse ?? jest.fn().mockResolvedValue(undefined),
    assertTeacherCourseRole: options.assertTeacherCourseRole ?? jest.fn().mockResolvedValue(undefined)
  }

  const service = new ChatService(
    roomRepository as any,
    messageRepository as any,
    courseRepository as any,
    userRepository as any,
    courseTeacherRepository as any,
    courseStudentRepository as any,
    studentRepository as any,
    accessService as any,
    notificationsService as any
  )

  return { service, mocks: { roomRepository, messageRepository, courseRepository, userRepository, courseTeacherRepository, accessService, notificationsService } }
}

describe('ChatService', () => {
  const headTeacher = { sub: 3, email: 'profesor@aulafy.cl', role: RoleName.PROFESOR }
  const subjectTeacher = { sub: 5, email: 'profesor.asignatura@aulafy.cl', role: RoleName.PROFESOR }
  const apoderado = { sub: 4, email: 'apoderado@aulafy.cl', role: RoleName.APODERADO }
  const estudiante = { sub: 6, email: 'estudiante@aulafy.cl', role: RoleName.ESTUDIANTE }
  const profesor = headTeacher

  it('PROFESOR lista salas de cursos asignados via course_teachers', async () => {
    const { service, mocks } = buildChatService()

    const result = await service.listRooms(profesor)

    expect(result).toHaveLength(1)
    expect(result[0].courseId).toBe(1)
    expect(result[0].courseName).toBe('6 Basico B')
    expect(mocks.accessService.findHeadTeacherCourseIds).toHaveBeenCalledWith(profesor.sub)
  })

  it('APODERADO recibe ForbiddenException al intentar crear una sala', async () => {
    const { service } = buildChatService()

    await expect(service.createRoom({ courseId: 1, name: 'Chat test' }, apoderado))
      .rejects.toThrow(ForbiddenException)
  })

  it('usuario con acceso al curso puede enviar un mensaje', async () => {
    const { service } = buildChatService()

    const result = await service.createMessage(1, { content: 'Mensaje de prueba' }, profesor)

    expect(result.content).toBe('Mensaje de prueba')
    expect(result.authorId).toBe(3)
  })

  it('usuario sin acceso al curso recibe ForbiddenException al leer mensajes', async () => {
    const { service } = buildChatService({
      assertCanViewCourse: jest.fn().mockRejectedValue(
        new ForbiddenException('No tienes permiso para ver este curso')
      )
    })

    await expect(service.findMessagesByRoom(1, apoderado)).rejects.toThrow(ForbiddenException)
  })

  // DEF-001: verificación de autorización HEAD_TEACHER en chat

  it('HEAD_TEACHER puede crear una sala de chat', async () => {
    const { service } = buildChatService({
      assertTeacherCourseRole: jest.fn().mockResolvedValue(undefined)
    })

    const result = await service.createRoom({ courseId: 1, name: 'Chat test' }, headTeacher)

    expect(result.courseId).toBe(1)
  })

  it('SUBJECT_TEACHER recibe ForbiddenException al crear una sala de chat', async () => {
    const { service } = buildChatService({
      assertTeacherCourseRole: jest.fn().mockRejectedValue(
        new ForbiddenException('No tienes permiso para esta accion en el curso')
      )
    })

    await expect(service.createRoom({ courseId: 1, name: 'Chat test' }, subjectTeacher))
      .rejects.toThrow(ForbiddenException)
  })

  it('SUBJECT_TEACHER recibe ForbiddenException al leer mensajes por roomId directo', async () => {
    const { service } = buildChatService({
      assertTeacherCourseRole: jest.fn().mockRejectedValue(
        new ForbiddenException('No tienes permiso para esta accion en el curso')
      )
    })

    await expect(service.findMessagesByRoom(1, subjectTeacher))
      .rejects.toThrow(ForbiddenException)
  })

  it('SUBJECT_TEACHER recibe ForbiddenException al enviar mensajes por roomId directo', async () => {
    const { service } = buildChatService({
      assertTeacherCourseRole: jest.fn().mockRejectedValue(
        new ForbiddenException('No tienes permiso para esta accion en el curso')
      )
    })

    await expect(service.createMessage(1, { content: 'Mensaje no autorizado' }, subjectTeacher))
      .rejects.toThrow(ForbiddenException)
  })

  it('APODERADO vinculado puede leer mensajes de su curso', async () => {
    const { service } = buildChatService({
      assertCanViewCourse: jest.fn().mockResolvedValue(undefined)
    })

    const result = await service.findMessagesByRoom(1, apoderado)

    expect(Array.isArray(result)).toBe(true)
  })

  it('usuario sin vinculo al curso recibe ForbiddenException al leer mensajes', async () => {
    const { service } = buildChatService({
      assertCanViewCourse: jest.fn().mockRejectedValue(
        new ForbiddenException('No tienes permiso para ver este curso')
      )
    })

    await expect(service.findMessagesByRoom(1, apoderado))
      .rejects.toThrow(ForbiddenException)
  })

  // Casos adicionales: APODERADO puede enviar mensajes

  it('APODERADO vinculado puede enviar un mensaje', async () => {
    const apoderadoUser = { id: '4', fullName: 'Apoderado Demo', email: 'apoderado@aulafy.cl', active: true, telegramChatId: null }
    const { service } = buildChatService({
      userFindOne: jest.fn().mockResolvedValue(apoderadoUser)
    })

    const result = await service.createMessage(1, { content: 'Consulta para el profesor' }, apoderado)

    expect(result.content).toBe('Consulta para el profesor')
    expect(result.authorId).toBe(4)
    expect(result.authorName).toBe('Apoderado Demo')
  })

  // Casos adicionales: verificacion de argumentos en assertTeacherCourseRole

  it('createRoom pasa HEAD_TEACHER a assertTeacherCourseRole', async () => {
    const assertTeacherCourseRole = jest.fn().mockResolvedValue(undefined)
    const { service } = buildChatService({ assertTeacherCourseRole })

    await service.createRoom({ courseId: 1, name: 'Chat test' }, headTeacher)

    expect(assertTeacherCourseRole).toHaveBeenCalledWith(
      expect.objectContaining({ role: RoleName.PROFESOR }),
      1,
      ['HEAD_TEACHER']
    )
  })

  it('findMessagesByRoom pasa HEAD_TEACHER a assertTeacherCourseRole', async () => {
    const assertTeacherCourseRole = jest.fn().mockResolvedValue(undefined)
    const { service } = buildChatService({ assertTeacherCourseRole })

    await service.findMessagesByRoom(1, headTeacher)

    expect(assertTeacherCourseRole).toHaveBeenCalledWith(
      expect.objectContaining({ role: RoleName.PROFESOR }),
      1,
      ['HEAD_TEACHER']
    )
  })

  it('createMessage pasa HEAD_TEACHER a assertTeacherCourseRole', async () => {
    const assertTeacherCourseRole = jest.fn().mockResolvedValue(undefined)
    const { service } = buildChatService({ assertTeacherCourseRole })

    await service.createMessage(1, { content: 'Mensaje verificado' }, headTeacher)

    expect(assertTeacherCourseRole).toHaveBeenCalledWith(
      expect.objectContaining({ role: RoleName.PROFESOR }),
      1,
      ['HEAD_TEACHER']
    )
  })

  // DEF-001 complemento: SUBJECT_TEACHER no recibe notificacion Telegram

  it('SUBJECT_TEACHER no recibe notificacion Telegram del chat', async () => {
    const subjectTeacherUser = { id: '5', fullName: 'Profesor Asignatura', telegramChatId: 'chat_5', active: true }

    const { service, mocks } = buildChatService({
      courseTeacherLinks: [
        { teacherId: '3', courseId: '1', roleInCourse: 'HEAD_TEACHER' },
        { teacherId: '5', courseId: '1', roleInCourse: 'SUBJECT_TEACHER' }
      ],
      userFindMany: jest.fn().mockResolvedValue([subjectTeacherUser])
    })

    await service.createMessage(1, { content: 'Hola chat' }, headTeacher)

    expect(mocks.notificationsService.sendTypedMessage).not.toHaveBeenCalled()
  })

  // DEF-001 complemento: HEAD_TEACHER recibe notificacion Telegram, SUBJECT_TEACHER no

  it('HEAD_TEACHER recibe notificacion Telegram cuando APODERADO envia un mensaje', async () => {
    const headTeacherUser = { id: '3', fullName: 'Profesor Jefe', telegramChatId: 'chat_head', active: true }
    const subjectTeacherUser = { id: '5', fullName: 'Profesor Asignatura', telegramChatId: 'chat_subject', active: true }
    // telegramChatId intencionalmente configurado para verificar que el autor queda excluido
    const apoderadoUser = { id: '4', fullName: 'Apoderado Demo', email: 'apoderado@aulafy.cl', active: true, telegramChatId: 'chat_author' }

    const { service, mocks } = buildChatService({
      courseTeacherLinks: [
        { teacherId: '3', courseId: '1', roleInCourse: 'HEAD_TEACHER' },
        { teacherId: '5', courseId: '1', roleInCourse: 'SUBJECT_TEACHER' }
      ],
      availableUsers: [headTeacherUser, subjectTeacherUser, apoderadoUser],
      userFindOne: jest.fn().mockResolvedValue(apoderadoUser)
    })

    await service.createMessage(1, { content: 'Consulta de apoderado' }, apoderado)

    expect(mocks.notificationsService.sendTypedMessage).toHaveBeenCalledTimes(1)
    expect(mocks.notificationsService.sendTypedMessage).toHaveBeenCalledWith(
      4,
      'TELEGRAM_CHAT_MESSAGE',
      expect.stringContaining('Nuevo mensaje'),
      'chat_head'
    )
    expect(mocks.notificationsService.sendTypedMessage).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      'chat_subject'
    )
    expect(mocks.notificationsService.sendTypedMessage).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      'chat_author'
    )
  })

  // Casos: ESTUDIANTE

  it('ESTUDIANTE vinculado puede leer mensajes', async () => {
    const { service, mocks } = buildChatService()

    const result = await service.findMessagesByRoom(1, estudiante)

    expect(Array.isArray(result)).toBe(true)
    expect(mocks.accessService.assertCanViewCourse).toHaveBeenCalledWith(
      expect.objectContaining({ role: RoleName.ESTUDIANTE }),
      1
    )
  })

  it('ESTUDIANTE vinculado puede enviar un mensaje', async () => {
    const estudianteUser = { id: '6', fullName: 'Estudiante Demo', email: 'estudiante@aulafy.cl', active: true, telegramChatId: null }
    const { service, mocks } = buildChatService({
      userFindOne: jest.fn().mockResolvedValue(estudianteUser)
    })

    const result = await service.createMessage(1, { content: 'Tengo una duda' }, estudiante)

    expect(result.content).toBe('Tengo una duda')
    expect(result.authorId).toBe(6)
    expect(mocks.accessService.assertCanViewCourse).toHaveBeenCalledWith(
      expect.objectContaining({ role: RoleName.ESTUDIANTE }),
      1
    )
  })

  it('ESTUDIANTE sin vinculo recibe ForbiddenException al leer mensajes', async () => {
    const { service } = buildChatService({
      assertCanViewCourse: jest.fn().mockRejectedValue(
        new ForbiddenException('No tienes permiso para ver este curso')
      )
    })

    await expect(service.findMessagesByRoom(1, estudiante)).rejects.toThrow(ForbiddenException)
  })
})
