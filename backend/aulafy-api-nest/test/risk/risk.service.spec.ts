import { RiskService } from '../../src/risk/risk.service'
import { AttendanceStatus } from '../../src/attendance/enums/attendance-status.enum'
import { EvaluationType } from '../../src/academic/enums/evaluation-type.enum'
import { RoleName } from '../../src/users/enums/role-name.enum'

function queryBuilderResult<T>(rows: T[]) {
  return {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(rows)
  }
}

function buildRiskService(options: {
  courses?: any[]
  enrollments?: any[]
  students?: any[]
  levels?: any[]
  grades?: any[]
  evaluations?: any[]
  attendance?: any[]
}) {
  const attendanceRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(queryBuilderResult(options.attendance ?? []))
  }
  const courseRepository = {
    find: jest.fn().mockResolvedValue(options.courses ?? [course()])
  }
  const courseStudentRepository = {
    find: jest.fn().mockResolvedValue(options.enrollments ?? [{ courseId: '10', studentId: '1' }])
  }
  const evaluationRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(queryBuilderResult(options.evaluations ?? []))
  }
  const gradeRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(queryBuilderResult(options.grades ?? []))
  }
  const levelRepository = {
    find: jest.fn().mockResolvedValue(options.levels ?? [level()])
  }
  const studentRepository = {
    find: jest.fn().mockResolvedValue(options.students ?? [student()])
  }
  const accessService = {
    findVisibleCourseIds: jest.fn().mockResolvedValue((options.courses ?? [course()]).map((item) => Number(item.id)))
  }

  return {
    service: new RiskService(
      attendanceRepository as any,
      courseRepository as any,
      courseStudentRepository as any,
      evaluationRepository as any,
      gradeRepository as any,
      levelRepository as any,
      studentRepository as any,
      accessService as any
    ),
    repositories: {
      attendanceRepository,
      courseRepository,
      courseStudentRepository,
      evaluationRepository,
      gradeRepository,
      levelRepository,
      studentRepository,
      accessService
    }
  }
}

describe('RiskService', () => {
  const admin = { sub: 1, email: 'admin@aulafy.cl', role: RoleName.ADMIN }

  it('marca en riesgo academico a estudiante con promedio menor a 4.0', async () => {
    const { service } = buildRiskService({
      grades: [
        grade({ score: '3.5' }),
        grade({ id: '2', score: '3.8' })
      ],
      evaluations: [evaluation()]
    })

    const result = await service.academicRisk(admin)

    expect(result.summary.totalStudents).toBe(1)
    expect(result.summary.riskStudents).toBe(1)
    expect(result.summary.academicRisk).toBe(1)
    expect(result.items).toHaveLength(1)
    expect(result.items[0]).toMatchObject({
      studentId: 1,
      averageScore: 3.65,
      riskType: 'ACADEMICO',
      severity: 'MODERADO'
    })
  })

  it('marca en riesgo por asistencia a estudiante bajo 85%', async () => {
    const { service } = buildRiskService({
      attendance: [
        attendance({ id: '1', status: AttendanceStatus.PRESENTE }),
        attendance({ id: '2', status: AttendanceStatus.PRESENTE }),
        attendance({ id: '3', status: AttendanceStatus.AUSENTE }),
        attendance({ id: '4', status: AttendanceStatus.AUSENTE }),
        attendance({ id: '5', status: AttendanceStatus.AUSENTE }),
        attendance({ id: '6', status: AttendanceStatus.AUSENTE }),
        attendance({ id: '7', status: AttendanceStatus.AUSENTE }),
        attendance({ id: '8', status: AttendanceStatus.AUSENTE }),
        attendance({ id: '9', status: AttendanceStatus.AUSENTE }),
        attendance({ id: '10', status: AttendanceStatus.AUSENTE })
      ]
    })

    const result = await service.academicRisk(admin)

    expect(result.summary.riskStudents).toBe(1)
    expect(result.summary.attendanceRisk).toBe(1)
    expect(result.items[0]).toMatchObject({
      attendanceRecords: 10,
      absentRecords: 8,
      attendancePercentage: 20,
      riskType: 'ASISTENCIA',
      severity: 'CRITICO'
    })
  })

  it('no incluye estudiante con promedio y asistencia sin riesgo', async () => {
    const { service } = buildRiskService({
      grades: [
        grade({ score: '6.0' }),
        grade({ id: '2', score: '5.5' })
      ],
      evaluations: [evaluation()],
      attendance: [
        attendance({ id: '1', status: AttendanceStatus.PRESENTE }),
        attendance({ id: '2', status: AttendanceStatus.JUSTIFICADO })
      ]
    })

    const result = await service.academicRisk(admin)

    expect(result.summary.totalStudents).toBe(1)
    expect(result.summary.evaluatedStudents).toBe(1)
    expect(result.summary.riskStudents).toBe(0)
    expect(result.items).toEqual([])
  })

  it('devuelve reporte vacio cuando no hay datos visibles', async () => {
    const { service } = buildRiskService({
      courses: [],
      enrollments: [],
      students: []
    })

    const result = await service.academicRisk(admin)

    expect(result.summary).toEqual({
      totalStudents: 0,
      evaluatedStudents: 0,
      riskStudents: 0,
      academicRisk: 0,
      attendanceRisk: 0,
      combinedRisk: 0,
      criticalRisk: 0,
      moderateRisk: 0
    })
    expect(result.items).toEqual([])
  })

  describe('PROFESOR - acceso filtrado por cursos asignados', () => {
    const profesor = { sub: 5, email: 'profesor@aulafy.cl', role: RoleName.PROFESOR }

    it('delega la resolucion de cursos visibles a accessService', async () => {
      const { service, repositories } = buildRiskService({})

      await service.academicRisk(profesor)

      expect(repositories.accessService.findVisibleCourseIds).toHaveBeenCalledWith(profesor)
      expect(repositories.courseRepository.find).toHaveBeenCalled()
    })

    it('incluye solo estudiantes de los cursos asignados al profesor', async () => {
      const cursoAsignado = course({ id: '10' })
      const { service } = buildRiskService({
        courses: [cursoAsignado],
        enrollments: [{ courseId: '10', studentId: '1' }],
        students: [student({ id: '1' })]
      })

      const result = await service.academicRisk(profesor)

      expect(result.summary.totalStudents).toBe(1)
    })

    it('devuelve reporte vacio cuando el profesor no tiene cursos asignados', async () => {
      const { service } = buildRiskService({
        courses: [],
        enrollments: [],
        students: []
      })

      const result = await service.academicRisk(profesor)

      expect(result.summary.totalStudents).toBe(0)
      expect(result.items).toEqual([])
    })
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

function level(overrides: Partial<any> = {}) {
  return {
    id: '1',
    name: '1 Basico',
    active: true,
    ...overrides
  }
}

function evaluation(overrides: Partial<any> = {}) {
  return {
    id: '100',
    courseId: '10',
    subjectId: '50',
    title: 'Control Unidad 1',
    description: 'Control demo',
    type: EvaluationType.CONTROL,
    evaluationDate: '2026-06-01',
    weight: 1,
    active: true,
    ...overrides
  }
}

function grade(overrides: Partial<any> = {}) {
  return {
    id: '1',
    studentId: '1',
    evaluationId: '100',
    score: '3.5',
    maxScore: '7.0',
    observation: null,
    createdAt: new Date('2026-06-01T00:00:00.000Z'),
    ...overrides
  }
}

function attendance(overrides: Partial<any> = {}) {
  return {
    id: '1',
    studentId: '1',
    courseId: '10',
    date: '2026-06-01',
    status: AttendanceStatus.PRESENTE,
    comment: null,
    ...overrides
  }
}
