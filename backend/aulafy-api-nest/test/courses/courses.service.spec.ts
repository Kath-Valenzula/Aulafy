import { CoursesService } from '../../src/courses/courses.service'
import { RoleName } from '../../src/users/enums/role-name.enum'

describe('CoursesService', () => {
  let courseRepository: { findOne: jest.Mock }
  let courseStudentRepository: { find: jest.Mock; count: jest.Mock; createQueryBuilder: jest.Mock }
  let courseTeacherRepository: { count: jest.Mock; createQueryBuilder: jest.Mock }
  let subjectRepository: Record<string, jest.Mock>
  let userRepository: Record<string, jest.Mock>
  let levelRepository: { find: jest.Mock }
  let cycleRepository: Record<string, jest.Mock>
  let studentRepository: { find: jest.Mock }
  let accessService: { assertCanViewCourse: jest.Mock; findVisibleCourseIds: jest.Mock }
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
      createQueryBuilder: jest.fn()
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
      findVisibleCourseIds: jest.fn()
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
