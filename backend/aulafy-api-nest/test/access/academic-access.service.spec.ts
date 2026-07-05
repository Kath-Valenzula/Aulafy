import { ForbiddenException } from '@nestjs/common'
import { AcademicAccessService } from '../../src/common/access/academic-access.service'
import { RoleName } from '../../src/users/enums/role-name.enum'

describe('AcademicAccessService', () => {
  let courseStudentRepository: {
    count: jest.Mock
    find: jest.Mock
    createQueryBuilder: jest.Mock
  }
  let courseTeacherRepository: {
    count: jest.Mock
    find: jest.Mock
    findOne: jest.Mock
  }
  let studentRepository: {
    count: jest.Mock
    find: jest.Mock
  }
  let service: AcademicAccessService

  beforeEach(() => {
    courseStudentRepository = {
      count: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn()
    }
    courseTeacherRepository = {
      count: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn()
    }
    studentRepository = {
      count: jest.fn(),
      find: jest.fn()
    }
    service = new AcademicAccessService(
      courseStudentRepository as any,
      courseTeacherRepository as any,
      studentRepository as any
    )
  })

  it('permite acceso amplio a ADMIN', async () => {
    const admin = { sub: 1, email: 'admin@aulafy.cl', role: RoleName.ADMIN }

    await expect(service.assertCanViewCourse(admin, 10)).resolves.toBeUndefined()
    await expect(service.assertCanViewStudent(admin, 20)).resolves.toBeUndefined()
    await expect(service.assertCanManageCourse(admin, 10)).resolves.toBeUndefined()
    await expect(service.assertCanManageStudentRecord(admin, 20, 10)).resolves.toBeUndefined()
  })

  it('permite a PROFESOR acceder solo a cursos asignados', async () => {
    const teacher = { sub: 7, email: 'profesor@aulafy.cl', role: RoleName.PROFESOR }
    courseTeacherRepository.count.mockResolvedValueOnce(1)

    await expect(service.assertCanViewCourse(teacher, 10)).resolves.toBeUndefined()
    expect(courseTeacherRepository.count).toHaveBeenCalledWith({
      where: { courseId: '10', teacherId: '7' }
    })
  })

  it('deniega a PROFESOR un curso no asignado', async () => {
    const teacher = { sub: 7, email: 'profesor@aulafy.cl', role: RoleName.PROFESOR }
    courseTeacherRepository.count.mockResolvedValueOnce(0)

    await expect(service.assertCanViewCourse(teacher, 10)).rejects.toThrow(ForbiddenException)
  })

  it('permite a APODERADO ver solo estudiantes vinculados', async () => {
    const guardian = { sub: 8, email: 'apoderado@aulafy.cl', role: RoleName.APODERADO }
    studentRepository.count.mockResolvedValueOnce(1)

    await expect(service.assertCanViewStudent(guardian, 20)).resolves.toBeUndefined()
    expect(studentRepository.count).toHaveBeenCalledWith({
      where: { id: '20', guardianId: '8' }
    })
  })

  it('deniega a APODERADO estudiantes no vinculados', async () => {
    const guardian = { sub: 8, email: 'apoderado@aulafy.cl', role: RoleName.APODERADO }
    studentRepository.count.mockResolvedValueOnce(0)

    await expect(service.assertCanViewStudent(guardian, 20)).rejects.toThrow(ForbiddenException)
  })

  it('permite a ESTUDIANTE ver solo su propio registro', async () => {
    const studentUser = { sub: 9, email: 'estudiante@aulafy.cl', role: RoleName.ESTUDIANTE }
    studentRepository.count.mockResolvedValueOnce(1)

    await expect(service.assertCanViewStudent(studentUser, 30)).resolves.toBeUndefined()
    expect(studentRepository.count).toHaveBeenCalledWith({
      where: { id: '30', studentUserId: '9' }
    })
  })

  describe('assertTeacherCourseRole', () => {
    it('permite a ADMIN sin consultar role_in_course', async () => {
      const admin = { sub: 1, email: 'admin@aulafy.cl', role: RoleName.ADMIN }
      await expect(service.assertTeacherCourseRole(admin, 10, ['HEAD_TEACHER'])).resolves.toBeUndefined()
      expect(courseTeacherRepository.findOne).not.toHaveBeenCalled()
    })

    it('permite a COLEGIO sin consultar role_in_course', async () => {
      const colegio = { sub: 2, email: 'colegio@aulafy.cl', role: RoleName.COLEGIO }
      await expect(service.assertTeacherCourseRole(colegio, 10, ['HEAD_TEACHER'])).resolves.toBeUndefined()
      expect(courseTeacherRepository.findOne).not.toHaveBeenCalled()
    })

    it('permite a HEAD_TEACHER cuando es el rol requerido', async () => {
      const jefe = { sub: 6, email: 'profesor.jefe@aulafy.cl', role: RoleName.PROFESOR }
      courseTeacherRepository.findOne.mockResolvedValue({ courseId: '1', teacherId: '6', roleInCourse: 'HEAD_TEACHER' })
      await expect(service.assertTeacherCourseRole(jefe, 1, ['HEAD_TEACHER'])).resolves.toBeUndefined()
      expect(courseTeacherRepository.findOne).toHaveBeenCalledWith({ where: { courseId: '1', teacherId: '6' } })
    })

    it('deniega a SUBJECT_TEACHER cuando solo HEAD_TEACHER esta permitido', async () => {
      const asig = { sub: 7, email: 'profesor.asignatura@aulafy.cl', role: RoleName.PROFESOR }
      courseTeacherRepository.findOne.mockResolvedValue({ courseId: '1', teacherId: '7', roleInCourse: 'SUBJECT_TEACHER' })
      await expect(service.assertTeacherCourseRole(asig, 1, ['HEAD_TEACHER'])).rejects.toThrow(ForbiddenException)
    })

    it('deniega a ASSISTANT cuando solo HEAD_TEACHER y SUBJECT_TEACHER estan permitidos', async () => {
      const asistente = { sub: 8, email: 'asistente@aulafy.cl', role: RoleName.PROFESOR }
      courseTeacherRepository.findOne.mockResolvedValue({ courseId: '1', teacherId: '8', roleInCourse: 'ASSISTANT' })
      await expect(service.assertTeacherCourseRole(asistente, 1, ['HEAD_TEACHER', 'SUBJECT_TEACHER'])).rejects.toThrow(ForbiddenException)
    })

    it('deniega si el docente no tiene registro en el curso', async () => {
      const externo = { sub: 99, email: 'externo@aulafy.cl', role: RoleName.PROFESOR }
      courseTeacherRepository.findOne.mockResolvedValue(null)
      await expect(service.assertTeacherCourseRole(externo, 1, ['HEAD_TEACHER'])).rejects.toThrow(ForbiddenException)
    })
  })

  it('devuelve cursos visibles para APODERADO desde sus estudiantes vinculados', async () => {
    const guardian = { sub: 8, email: 'apoderado@aulafy.cl', role: RoleName.APODERADO }
    studentRepository.find.mockResolvedValue([{ id: '20' }, { id: '21' }])
    courseStudentRepository.find.mockResolvedValue([
      { courseId: '10', studentId: '20' },
      { courseId: '10', studentId: '21' },
      { courseId: '11', studentId: '21' }
    ])

    const result = await service.findVisibleCourseIds(guardian)

    expect(result).toEqual([10, 11])
  })
})
