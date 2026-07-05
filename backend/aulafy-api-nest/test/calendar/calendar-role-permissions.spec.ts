import { ForbiddenException } from '@nestjs/common'
import { CalendarService } from '../../src/calendar/calendar.service'
import { RoleName } from '../../src/users/enums/role-name.enum'

describe('CalendarService - permisos por role_in_course', () => {
  const demoCourse = { id: '1', name: '6 Basico B', active: true }
  const demoAuthor = { id: '6', fullName: 'Profesor Jefe Demo' }

  const headTeacher    = { sub: 6, email: 'profesor.jefe@aulafy.cl',       role: RoleName.PROFESOR }
  const subjectTeacher = { sub: 7, email: 'profesor.asignatura@aulafy.cl', role: RoleName.PROFESOR }
  const admin          = { sub: 1, email: 'admin@aulafy.cl',               role: RoleName.ADMIN }

  const savedEvent = {
    id: '1',
    courseId: '1',
    createdById: '6',
    title: 'Reunion de apoderados',
    description: 'Reunion general del curso.',
    type: 'REUNION',
    startAt: new Date('2026-08-01T18:00:00.000Z'),
    endAt: null,
    notifyTelegram: false,
    active: true,
    createdAt: new Date()
  }

  let eventRepository:    { create: jest.Mock; save: jest.Mock; find: jest.Mock }
  let courseRepository:   { findOne: jest.Mock }
  let userRepository:     { findOne: jest.Mock; find: jest.Mock }
  let courseTeacherRepository: { find: jest.Mock }
  let courseStudentRepository: { find: jest.Mock }
  let studentRepository:  { find: jest.Mock }
  let notificationsService: { sendTypedMessage: jest.Mock }
  let accessService: {
    assertCanManageCourse:   jest.Mock
    assertCanViewCourse:     jest.Mock
    assertTeacherCourseRole: jest.Mock
    findVisibleCourseIds:    jest.Mock
  }
  let service: CalendarService

  const reunionRequest = {
    title:       'Reunion de apoderados',
    description: 'Reunion general del curso.',
    type:        'REUNION' as const,
    startAt:     '2026-08-01T18:00:00.000Z',
    notifyTelegram: false
  }

  const pruebaRequest = {
    ...reunionRequest,
    type:  'PRUEBA' as const,
    title: 'Prueba de matematica'
  }

  const actividadRequest = {
    ...reunionRequest,
    type:  'ACTIVIDAD' as const,
    title: 'Dia de deportes'
  }

  const comunicadoRequest = {
    ...reunionRequest,
    type:  'COMUNICADO' as const,
    title: 'Comunicado institucional'
  }

  beforeEach(() => {
    eventRepository = {
      create: jest.fn().mockReturnValue(savedEvent),
      save:   jest.fn().mockResolvedValue(savedEvent),
      find:   jest.fn().mockResolvedValue([])
    }
    courseRepository      = { findOne: jest.fn().mockResolvedValue(demoCourse) }
    userRepository        = { findOne: jest.fn().mockResolvedValue(demoAuthor), find: jest.fn().mockResolvedValue([]) }
    courseTeacherRepository  = { find: jest.fn().mockResolvedValue([]) }
    courseStudentRepository  = { find: jest.fn().mockResolvedValue([]) }
    studentRepository     = { find: jest.fn().mockResolvedValue([]) }
    notificationsService  = { sendTypedMessage: jest.fn().mockResolvedValue(undefined) }
    accessService = {
      assertCanManageCourse:   jest.fn().mockResolvedValue(undefined),
      assertCanViewCourse:     jest.fn().mockResolvedValue(undefined),
      assertTeacherCourseRole: jest.fn().mockResolvedValue(undefined),
      findVisibleCourseIds:    jest.fn().mockResolvedValue([])
    }

    service = new CalendarService(
      eventRepository as any,
      courseRepository as any,
      userRepository as any,
      courseStudentRepository as any,
      courseTeacherRepository as any,
      studentRepository as any,
      accessService as any,
      notificationsService as any
    )
  })

  describe('evento REUNION (tipo general)', () => {
    it('HEAD_TEACHER puede crear evento general de curso', async () => {
      await expect(service.create(1, reunionRequest, headTeacher)).resolves.toBeDefined()
      expect(accessService.assertTeacherCourseRole).toHaveBeenCalledWith(headTeacher, 1, ['HEAD_TEACHER'])
    })

    it('SUBJECT_TEACHER no puede crear evento general de curso (REUNION)', async () => {
      accessService.assertTeacherCourseRole.mockRejectedValue(new ForbiddenException('No tienes permiso para esta accion en el curso'))

      await expect(service.create(1, reunionRequest, subjectTeacher)).rejects.toThrow(ForbiddenException)
      expect(accessService.assertTeacherCourseRole).toHaveBeenCalledWith(subjectTeacher, 1, ['HEAD_TEACHER'])
    })

    it('SUBJECT_TEACHER no puede crear evento ACTIVIDAD', async () => {
      accessService.assertTeacherCourseRole.mockRejectedValue(new ForbiddenException('No tienes permiso para esta accion en el curso'))

      await expect(service.create(1, actividadRequest, subjectTeacher)).rejects.toThrow(ForbiddenException)
      expect(accessService.assertTeacherCourseRole).toHaveBeenCalledWith(subjectTeacher, 1, ['HEAD_TEACHER'])
    })

    it('SUBJECT_TEACHER no puede crear evento COMUNICADO', async () => {
      accessService.assertTeacherCourseRole.mockRejectedValue(new ForbiddenException('No tienes permiso para esta accion en el curso'))

      await expect(service.create(1, comunicadoRequest, subjectTeacher)).rejects.toThrow(ForbiddenException)
      expect(accessService.assertTeacherCourseRole).toHaveBeenCalledWith(subjectTeacher, 1, ['HEAD_TEACHER'])
    })

    it('ADMIN puede crear cualquier evento sin restriccion de role_in_course', async () => {
      await expect(service.create(1, reunionRequest, admin)).resolves.toBeDefined()
      expect(accessService.assertTeacherCourseRole).not.toHaveBeenCalled()
    })
  })

  describe('evento PRUEBA (tipo academico)', () => {
    it('SUBJECT_TEACHER puede crear evento PRUEBA sin restriccion adicional', async () => {
      await expect(service.create(1, pruebaRequest, subjectTeacher)).resolves.toBeDefined()
      expect(accessService.assertTeacherCourseRole).not.toHaveBeenCalled()
    })

    it('HEAD_TEACHER puede crear evento PRUEBA', async () => {
      await expect(service.create(1, pruebaRequest, headTeacher)).resolves.toBeDefined()
      expect(accessService.assertTeacherCourseRole).not.toHaveBeenCalled()
    })
  })
})
