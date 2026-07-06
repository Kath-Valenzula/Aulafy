import { getMetadataArgsStorage } from 'typeorm'
import { CoursesService } from '../../src/courses/courses.service'
import { CourseTeacherEntity } from '../../src/courses/entities/course-teacher.entity'
import { RoleName } from '../../src/users/enums/role-name.enum'

describe('CoursesService', () => {
  let courseRepository: { findOne: jest.Mock }
  let courseStudentRepository: { find: jest.Mock; count: jest.Mock; createQueryBuilder: jest.Mock }
  let courseTeacherRepository: { count: jest.Mock; createQueryBuilder: jest.Mock; find: jest.Mock; findOne: jest.Mock }
  let subjectRepository: Record<string, jest.Mock>
  let userRepository: Record<string, jest.Mock>
  let levelRepository: { find: jest.Mock }
  let cycleRepository: Record<string, jest.Mock>
  let studentRepository: { find: jest.Mock }
  let accessService: { assertCanViewCourse: jest.Mock; findVisibleCourseIds: jest.Mock; getTeacherRoleInCourse: jest.Mock }
  let service: CoursesService

  beforeEach(() => {
    courseRepository = {
      findOne: jest.fn().mockResolvedValue(course())
    }
    courseStudentRepository = {
      find: jest.fn().mockResolvedValue([
        { courseId: '10', studentId: '1' },
        { courseId: '10', studentId: '2' }
      ]),
      count: jest.fn(),
      createQueryBuilder: jest.fn()
    }
    courseTeacherRepository = {
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null)
    }
    subjectRepository = {}
    userRepository = {}
    levelRepository = {
      find: jest.fn().mockResolvedValue([{ id: '1', name: '1 Basico' }])
    }
    cycleRepository = {}
    studentRepository = {
      find: jest.fn().mockResolvedValue([
        student({ id: '1', firstName: 'Camila', lastName: 'Rojas', guardianId: '8', studentUserId: '9' }),
        student({ id: '2', firstName: 'Mateo', lastName: 'Diaz', guardianId: '18', studentUserId: '19' })
      ])
    }
    accessService = {
      assertCanViewCourse: jest.fn().mockResolvedValue(undefined),
      findVisibleCourseIds: jest.fn(),
      getTeacherRoleInCourse: jest.fn().mockResolvedValue('HEAD_TEACHER')
    }
    service = new CoursesService(
      courseRepository as any,
      courseStudentRepository as any,
      courseTeacherRepository as any,
      subjectRepository as any,
      userRepository as any,
      levelRepository as any,
      cycleRepository as any,
      studentRepository as any,
      accessService as any
    )
  })

  it('filtra estudiantes del curso para APODERADO segun su vinculo', async () => {
    const result = await service.findStudentsByCourse(10, {
      sub: 8,
      email: 'apoderado@aulafy.cl',
      role: RoleName.APODERADO
    })

    expect(result).toEqual([
      {
        id: 1,
        firstName: 'Camila',
        lastName: 'Rojas',
        fullName: 'Camila Rojas',
        levelName: '1 Basico',
        section: 'A',
        guardianId: 8,
        studentUserId: 9
      }
    ])
  })

  it('filtra estudiantes del curso para ESTUDIANTE segun su propio usuario', async () => {
    const result = await service.findStudentsByCourse(10, {
      sub: 19,
      email: 'estudiante@aulafy.cl',
      role: RoleName.ESTUDIANTE
    })

    expect(result).toEqual([
      {
        id: 2,
        firstName: 'Mateo',
        lastName: 'Diaz',
        fullName: 'Mateo Diaz',
        levelName: '1 Basico',
        section: 'A',
        guardianId: 18,
        studentUserId: 19
      }
    ])
  })

  describe('role_in_course', () => {
    it('findTeachersByCourse devuelve HEAD_TEACHER y SUBJECT_TEACHER con sus labels', async () => {
      courseTeacherRepository.find = jest.fn().mockResolvedValue([
        { courseId: '10', teacherId: '7', roleInCourse: 'HEAD_TEACHER' },
        { courseId: '10', teacherId: '8', roleInCourse: 'SUBJECT_TEACHER' }
      ])
      userRepository.find = jest.fn().mockResolvedValue([
        { id: '7', fullName: 'Juan Perez' },
        { id: '8', fullName: 'Maria Lopez' }
      ])

      const result = await service.findTeachersByCourse(10, {
        sub: 1,
        email: 'admin@aulafy.cl',
        role: RoleName.ADMIN
      })

      expect(result).toEqual([
        { teacherId: 7, teacherName: 'Juan Perez', roleInCourse: 'HEAD_TEACHER', roleLabel: 'Profesor jefe' },
        { teacherId: 8, teacherName: 'Maria Lopez', roleInCourse: 'SUBJECT_TEACHER', roleLabel: 'Profesor de asignatura' }
      ])
    })

    it('findTeachersByCourse devuelve label Asistente para ASSISTANT', async () => {
      courseTeacherRepository.find = jest.fn().mockResolvedValue([
        { courseId: '10', teacherId: '9', roleInCourse: 'ASSISTANT' }
      ])
      userRepository.find = jest.fn().mockResolvedValue([
        { id: '9', fullName: 'Carlos Ayala' }
      ])

      const result = await service.findTeachersByCourse(10, {
        sub: 1,
        email: 'admin@aulafy.cl',
        role: RoleName.ADMIN
      })

      expect(result[0]).toMatchObject({ roleInCourse: 'ASSISTANT', roleLabel: 'Asistente' })
    })

    it('la entidad CourseTeacherEntity declara default SUBJECT_TEACHER para roleInCourse', () => {
      const col = getMetadataArgsStorage().columns.find(
        (c) => c.target === CourseTeacherEntity && c.propertyName === 'roleInCourse'
      )
      expect((col?.options as any)?.default).toBe('SUBJECT_TEACHER')
    })
  })

  it('mantiene la lista completa para PROFESOR autorizado', async () => {
    const result = await service.findStudentsByCourse(10, {
      sub: 7,
      email: 'profesor@aulafy.cl',
      role: RoleName.PROFESOR
    })

    expect(result.map((item) => item.id)).toEqual([1, 2])
  })
})

function course(overrides: Partial<any> = {}) {
  return {
    id: '10',
    name: '1 Basico A',
    level: '1 Basico',
    section: 'A',
    schoolName: 'Colegio Demo',
    active: true,
    ...overrides
  }
}

function student(overrides: Partial<any> = {}) {
  return {
    id: '1',
    firstName: 'Camila',
    lastName: 'Rojas',
    levelId: '1',
    section: 'A',
    guardianId: '8',
    studentUserId: '9',
    active: true,
    ...overrides
  }
}
