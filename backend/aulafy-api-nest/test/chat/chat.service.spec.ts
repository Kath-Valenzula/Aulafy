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
  const userRepository = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(userFixture())
  }
  const courseTeacherRepository = { find: jest.fn().mockResolvedValue([]) }
  const courseStudentRepository = { find: jest.fn().mockResolvedValue([]) }
  const studentRepository = { find: jest.fn().mockResolvedValue([]) }
  const notificationsService = { sendTypedMessage: jest.fn().mockResolvedValue(undefined) }

  const accessService = {
    findVisibleCourseIds: options.findVisibleCourseIds ?? jest.fn().mockResolvedValue([1]),
    findHeadTeacherCourseIds: options.findHeadTeacherCourseIds ?? jest.fn().mockResolvedValue([1]),
    assertCanViewCourse: options.assertCanViewCourse ?? jest.fn().mockResolvedValue(undefined),
    assertCanManageCourse: options.assertCanManageCourse ?? jest.fn().mockResolvedValue(undefined)
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

  return { service, mocks: { roomRepository, messageRepository, courseRepository, userRepository, accessService, notificationsService } }
}

describe('ChatService', () => {
  const profesor = { sub: 3, email: 'profesor@aulafy.cl', role: RoleName.PROFESOR }
  const apoderado = { sub: 4, email: 'apoderado@aulafy.cl', role: RoleName.APODERADO }

  it('PROFESOR lista salas de cursos asignados via course_teachers', async () => {
    const { service, mocks } = buildChatService()

    const result = await service.listRooms(profesor)

    expect(result).toHaveLength(1)
    expect(result[0].courseId).toBe(1)
    expect(result[0].courseName).toBe('6 Basico B')
    expect(mocks.accessService.findHeadTeacherCourseIds).toHaveBeenCalledWith(profesor.sub)
  })

  it('APODERADO recibe ForbiddenException al intentar crear una sala', async () => {
    const { service } = buildChatService({
      assertCanManageCourse: jest.fn().mockRejectedValue(
        new ForbiddenException('No tienes permiso para administrar este curso')
      )
    })

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
})
