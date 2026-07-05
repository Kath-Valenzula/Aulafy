import { ForbiddenException } from '@nestjs/common'
import { AnnotationsService } from '../../src/annotations/annotations.service'
import { AnnotationType } from '../../src/annotations/enums/annotation-type.enum'
import { RoleName } from '../../src/users/enums/role-name.enum'

describe('AnnotationsService - permisos por role_in_course', () => {
  const demoStudent = {
    id: '1',
    firstName: 'Ana',
    lastName: 'Gomez',
    active: true,
    studentUserId: null,
    guardianId: null
  }
  const demoCourse = { id: '1', name: '6 Basico B', active: true }
  const demoAuthor = { id: '6', fullName: 'Profesor Jefe Demo' }

  const headTeacher    = { sub: 6, email: 'profesor.jefe@aulafy.cl',       role: RoleName.PROFESOR }
  const subjectTeacher = { sub: 7, email: 'profesor.asignatura@aulafy.cl', role: RoleName.PROFESOR }
  const assistant      = { sub: 8, email: 'asistente@aulafy.cl',           role: RoleName.PROFESOR }
  const admin          = { sub: 1, email: 'admin@aulafy.cl',               role: RoleName.ADMIN }

  const conductualRequest = {
    studentId: 1,
    courseId:  1,
    type:      AnnotationType.CONDUCTUAL,
    severity:  'MEDIA' as any,
    title:     'Conducta disruptiva',
    description: 'El alumno interrumpio la clase repetidamente.'
  }

  const academicaRequest = {
    ...conductualRequest,
    type:        AnnotationType.ACADEMICA,
    title:       'Refuerzo academico',
    description: 'Se recomienda apoyo en matematica.'
  }

  let annotationRepository: { find: jest.Mock; create: jest.Mock; save: jest.Mock }
  let studentRepository:    { findOne: jest.Mock }
  let courseRepository:     { findOne: jest.Mock }
  let courseStudentRepository: { count: jest.Mock }
  let userRepository:       { findOne: jest.Mock; find: jest.Mock }
  let notificationsService: { sendTypedMessage: jest.Mock }
  let accessService: {
    assertCanViewCourse:          jest.Mock
    assertCanViewStudent:         jest.Mock
    assertCanManageStudentRecord: jest.Mock
    assertTeacherCourseRole:      jest.Mock
    findVisibleCourseIds:         jest.Mock
    findVisibleStudentIds:        jest.Mock
  }
  let service: AnnotationsService

  beforeEach(() => {
    const savedAnnotation = {
      id: '1',
      createdAt: new Date(),
      studentId: '1',
      courseId:  '1',
      createdById: '6',
      type:     AnnotationType.CONDUCTUAL,
      severity: 'MEDIA',
      status:   'PENDIENTE',
      title:    'Conducta disruptiva',
      description: 'El alumno interrumpio la clase repetidamente.',
      active: true
    }

    annotationRepository = {
      find:   jest.fn().mockResolvedValue([]),
      create: jest.fn().mockReturnValue(savedAnnotation),
      save:   jest.fn().mockResolvedValue(savedAnnotation)
    }
    studentRepository    = { findOne: jest.fn().mockResolvedValue(demoStudent) }
    courseRepository     = { findOne: jest.fn().mockResolvedValue(demoCourse) }
    courseStudentRepository = { count: jest.fn().mockResolvedValue(1) }
    userRepository = {
      findOne: jest.fn().mockResolvedValue(demoAuthor),
      find:    jest.fn().mockResolvedValue([])
    }
    notificationsService = { sendTypedMessage: jest.fn().mockResolvedValue(undefined) }
    accessService = {
      assertCanViewCourse:          jest.fn().mockResolvedValue(undefined),
      assertCanViewStudent:         jest.fn().mockResolvedValue(undefined),
      assertCanManageStudentRecord: jest.fn().mockResolvedValue(undefined),
      assertTeacherCourseRole:      jest.fn().mockResolvedValue(undefined),
      findVisibleCourseIds:         jest.fn().mockResolvedValue([]),
      findVisibleStudentIds:        jest.fn().mockResolvedValue([])
    }

    service = new AnnotationsService(
      annotationRepository as any,
      studentRepository as any,
      courseRepository as any,
      courseStudentRepository as any,
      userRepository as any,
      accessService as any,
      notificationsService as any
    )
  })

  describe('anotacion CONDUCTUAL', () => {
    it('HEAD_TEACHER puede crear anotacion conductual', async () => {
      await expect(service.create(conductualRequest, headTeacher)).resolves.toBeDefined()
      expect(accessService.assertTeacherCourseRole).toHaveBeenCalledWith(headTeacher, 1, ['HEAD_TEACHER'])
    })

    it('SUBJECT_TEACHER no puede crear anotacion conductual', async () => {
      accessService.assertTeacherCourseRole.mockRejectedValue(new ForbiddenException('No tienes permiso para esta accion en el curso'))

      await expect(service.create(conductualRequest, subjectTeacher)).rejects.toThrow(ForbiddenException)
      expect(accessService.assertTeacherCourseRole).toHaveBeenCalledWith(subjectTeacher, 1, ['HEAD_TEACHER'])
    })

    it('ASSISTANT no puede crear anotacion conductual', async () => {
      accessService.assertTeacherCourseRole.mockRejectedValue(new ForbiddenException('No tienes permiso para esta accion en el curso'))

      await expect(service.create(conductualRequest, assistant)).rejects.toThrow(ForbiddenException)
      expect(accessService.assertTeacherCourseRole).toHaveBeenCalledWith(assistant, 1, ['HEAD_TEACHER'])
    })

    it('ADMIN puede crear anotacion conductual sin restriccion de role_in_course', async () => {
      await expect(service.create(conductualRequest, admin)).resolves.toBeDefined()
      expect(accessService.assertTeacherCourseRole).not.toHaveBeenCalled()
    })
  })

  describe('anotacion ACADEMICA', () => {
    it('SUBJECT_TEACHER puede crear anotacion academica sin restriccion adicional', async () => {
      await expect(service.create(academicaRequest, subjectTeacher)).resolves.toBeDefined()
      expect(accessService.assertTeacherCourseRole).not.toHaveBeenCalled()
    })

    it('HEAD_TEACHER puede crear anotacion academica', async () => {
      await expect(service.create(academicaRequest, headTeacher)).resolves.toBeDefined()
      expect(accessService.assertTeacherCourseRole).not.toHaveBeenCalled()
    })
  })
})
