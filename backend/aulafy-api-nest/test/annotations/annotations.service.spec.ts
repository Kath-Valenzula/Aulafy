import { AnnotationsService } from '../../src/annotations/annotations.service'
import { RoleName } from '../../src/users/enums/role-name.enum'

describe('AnnotationsService', () => {
  let annotationRepository: { find: jest.Mock }
  let accessService: {
    assertCanViewCourse: jest.Mock
    assertCanViewStudent: jest.Mock
    findVisibleCourseIds: jest.Mock
    findVisibleStudentIds: jest.Mock
  }
  let service: AnnotationsService

  beforeEach(() => {
    annotationRepository = {
      find: jest.fn().mockResolvedValue([])
    }
    accessService = {
      assertCanViewCourse: jest.fn(),
      assertCanViewStudent: jest.fn(),
      findVisibleCourseIds: jest.fn(),
      findVisibleStudentIds: jest.fn()
    }
    service = new AnnotationsService(
      annotationRepository as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      accessService as any,
      {} as any
    )
  })

  it('filtra listado general de APODERADO por estudiantes vinculados', async () => {
    accessService.findVisibleStudentIds.mockResolvedValue([20, 21])

    await service.list({}, {
      sub: 8,
      email: 'apoderado@aulafy.cl',
      role: RoleName.APODERADO
    })

    expect(annotationRepository.find).toHaveBeenCalledWith({
      where: [
        { active: true, studentId: '20' },
        { active: true, studentId: '21' }
      ],
      order: { createdAt: 'DESC' }
    })
  })

  it('filtra listado general de PROFESOR por cursos asignados', async () => {
    accessService.findVisibleCourseIds.mockResolvedValue([10])

    await service.list({}, {
      sub: 7,
      email: 'profesor@aulafy.cl',
      role: RoleName.PROFESOR
    })

    expect(annotationRepository.find).toHaveBeenCalledWith({
      where: [{ active: true, courseId: '10' }],
      order: { createdAt: 'DESC' }
    })
  })
})
