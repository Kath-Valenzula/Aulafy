import { AnnotationsService } from '../../src/annotations/annotations.service'
import { AnnotationType } from '../../src/annotations/enums/annotation-type.enum'
import { RoleName } from '../../src/users/enums/role-name.enum'

describe('AnnotationsService - visibilidad de anotaciones CONDUCTUAL por role_in_course', () => {
  const headTeacher    = { sub: 6, email: 'profesor.jefe@aulafy.cl',       role: RoleName.PROFESOR }
  const subjectTeacher = { sub: 7, email: 'profesor.asignatura@aulafy.cl', role: RoleName.PROFESOR }
  const admin          = { sub: 1, email: 'admin@aulafy.cl',               role: RoleName.ADMIN }

  const makeAnnotation = (type: AnnotationType, courseId = '1') => ({
    id: '1',
    studentId: '1',
    courseId,
    createdById: '6',
    type,
    severity: 'MEDIA',
    status: 'PENDIENTE',
    title: 'Test',
    description: 'Descripcion',
    active: true,
    createdAt: new Date()
  })

  const conductualAnnotation   = makeAnnotation(AnnotationType.CONDUCTUAL)
  const academicaAnnotation    = makeAnnotation(AnnotationType.ACADEMICA)
  const comunicacionAnnotation = makeAnnotation(AnnotationType.COMUNICACION)

  const demoStudent = { id: '1', firstName: 'Ana', lastName: 'Gomez', active: true, studentUserId: null, guardianId: null }
  const demoCourse  = { id: '1', name: '6 Basico B', active: true }
  const demoUser    = { id: '6', fullName: 'Profesor Jefe Demo' }

  let annotationRepository: { find: jest.Mock; create: jest.Mock; save: jest.Mock }
  let studentRepository:    { find: jest.Mock; findOne: jest.Mock }
  let courseRepository:     { find: jest.Mock; findOne: jest.Mock }
  let courseStudentRepository: { count: jest.Mock }
  let userRepository:       { find: jest.Mock; findOne: jest.Mock }
  let notificationsService: { sendTypedMessage: jest.Mock }
  let accessService: {
    assertCanViewCourse:          jest.Mock
    assertCanViewStudent:         jest.Mock
    assertCanManageStudentRecord: jest.Mock
    assertTeacherCourseRole:      jest.Mock
    findVisibleCourseIds:         jest.Mock
    findVisibleStudentIds:        jest.Mock
    getTeacherRoleInCourse:       jest.Mock
  }
  let service: AnnotationsService

  beforeEach(() => {
    annotationRepository = {
      find:   jest.fn(),
      create: jest.fn(),
      save:   jest.fn()
    }
    studentRepository    = { find: jest.fn().mockResolvedValue([demoStudent]), findOne: jest.fn().mockResolvedValue(demoStudent) }
    courseRepository     = { find: jest.fn().mockResolvedValue([demoCourse]),  findOne: jest.fn().mockResolvedValue(demoCourse) }
    courseStudentRepository = { count: jest.fn().mockResolvedValue(1) }
    userRepository = {
      findOne: jest.fn().mockResolvedValue(demoUser),
      find:    jest.fn().mockResolvedValue([])
    }
    notificationsService = { sendTypedMessage: jest.fn().mockResolvedValue(undefined) }
    accessService = {
      assertCanViewCourse:          jest.fn().mockResolvedValue(undefined),
      assertCanViewStudent:         jest.fn().mockResolvedValue(undefined),
      assertCanManageStudentRecord: jest.fn().mockResolvedValue(undefined),
      assertTeacherCourseRole:      jest.fn().mockResolvedValue(undefined),
      findVisibleCourseIds:         jest.fn().mockResolvedValue([1]),
      findVisibleStudentIds:        jest.fn().mockResolvedValue([1]),
      getTeacherRoleInCourse:       jest.fn()
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

  describe('list() - filtrado por role_in_course', () => {
    it('HEAD_TEACHER recibe anotaciones CONDUCTUAL de su curso', async () => {
      annotationRepository.find.mockResolvedValue([conductualAnnotation, academicaAnnotation])
      accessService.getTeacherRoleInCourse.mockResolvedValue('HEAD_TEACHER')

      const result = await service.list({ courseId: 1 }, headTeacher)

      const types = result.map((a) => a.type)
      expect(types).toContain(AnnotationType.CONDUCTUAL)
      expect(types).toContain(AnnotationType.ACADEMICA)
    })

    it('SUBJECT_TEACHER no recibe anotaciones CONDUCTUAL del curso', async () => {
      annotationRepository.find.mockResolvedValue([conductualAnnotation, academicaAnnotation, comunicacionAnnotation])
      accessService.getTeacherRoleInCourse.mockResolvedValue('SUBJECT_TEACHER')

      const result = await service.list({ courseId: 1 }, subjectTeacher)

      const types = result.map((a) => a.type)
      expect(types).not.toContain(AnnotationType.CONDUCTUAL)
      expect(types).toContain(AnnotationType.ACADEMICA)
      expect(types).toContain(AnnotationType.COMUNICACION)
    })

    it('SUBJECT_TEACHER recibe lista vacia si solo hay CONDUCTUAL', async () => {
      annotationRepository.find.mockResolvedValue([conductualAnnotation])
      accessService.getTeacherRoleInCourse.mockResolvedValue('SUBJECT_TEACHER')

      const result = await service.list({ courseId: 1 }, subjectTeacher)

      expect(result).toEqual([])
    })

    it('ADMIN recibe todas las anotaciones sin filtro de role_in_course', async () => {
      annotationRepository.find.mockResolvedValue([conductualAnnotation, academicaAnnotation])

      const result = await service.list({ courseId: 1 }, admin)

      expect(accessService.getTeacherRoleInCourse).not.toHaveBeenCalled()
      const types = result.map((a) => a.type)
      expect(types).toContain(AnnotationType.CONDUCTUAL)
      expect(types).toContain(AnnotationType.ACADEMICA)
    })

    it('SUBJECT_TEACHER recibe anotaciones ACADEMICA y COMUNICACION sin restriccion', async () => {
      annotationRepository.find.mockResolvedValue([academicaAnnotation, comunicacionAnnotation])

      const result = await service.list({ courseId: 1 }, subjectTeacher)

      expect(accessService.getTeacherRoleInCourse).not.toHaveBeenCalled()
      const types = result.map((a) => a.type)
      expect(types).toContain(AnnotationType.ACADEMICA)
      expect(types).toContain(AnnotationType.COMUNICACION)
    })
  })

  describe('findByStudent() - filtrado por role_in_course', () => {
    it('HEAD_TEACHER recibe anotaciones CONDUCTUAL del estudiante', async () => {
      annotationRepository.find.mockResolvedValue([conductualAnnotation, academicaAnnotation])
      accessService.getTeacherRoleInCourse.mockResolvedValue('HEAD_TEACHER')

      const result = await service.findByStudent(1, headTeacher)

      const types = result.map((a) => a.type)
      expect(types).toContain(AnnotationType.CONDUCTUAL)
    })

    it('SUBJECT_TEACHER no recibe anotaciones CONDUCTUAL del estudiante', async () => {
      annotationRepository.find.mockResolvedValue([conductualAnnotation, academicaAnnotation])
      accessService.getTeacherRoleInCourse.mockResolvedValue('SUBJECT_TEACHER')

      const result = await service.findByStudent(1, subjectTeacher)

      const types = result.map((a) => a.type)
      expect(types).not.toContain(AnnotationType.CONDUCTUAL)
      expect(types).toContain(AnnotationType.ACADEMICA)
    })

    it('ASSISTANT no recibe anotaciones CONDUCTUAL del estudiante', async () => {
      const assistant = { sub: 8, email: 'asistente@aulafy.cl', role: RoleName.PROFESOR }
      annotationRepository.find.mockResolvedValue([conductualAnnotation, comunicacionAnnotation])
      accessService.getTeacherRoleInCourse.mockResolvedValue('ASSISTANT')

      const result = await service.findByStudent(1, assistant)

      const types = result.map((a) => a.type)
      expect(types).not.toContain(AnnotationType.CONDUCTUAL)
    })
  })
})
