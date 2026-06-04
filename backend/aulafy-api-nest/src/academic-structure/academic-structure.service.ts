import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JwtPayload } from '../common/auth/jwt-payload.interface'
import { CourseStudentEntity } from '../courses/entities/course-student.entity'
import { CourseTeacherEntity } from '../courses/entities/course-teacher.entity'
import { RoleName } from '../users/enums/role-name.enum'
import { UserEntity } from '../users/entities/user.entity'
import { CreateCycleDto } from './dto/create-cycle.dto'
import { CreateLevelDto } from './dto/create-level.dto'
import { CreateStudentDto } from './dto/create-student.dto'
import { StudentsFilterDto } from './dto/students-filter.dto'
import { CycleEntity } from './entities/cycle.entity'
import { CycleLevelEntity } from './entities/cycle-level.entity'
import { LevelEntity } from './entities/level.entity'
import { StudentEntity } from './entities/student.entity'

const CHILE_LEVELS_ORDER = [
  'Playgroup',
  'PreKinder',
  'Kinder',
  '1ro Basico',
  '2do Basico',
  '3ro Basico',
  '4to Basico',
  '5to Basico',
  '6to Basico',
  '7mo Basico',
  '8vo Basico',
  '1ro Medio',
  '2do Medio',
  '3ro Medio',
  '4to Medio'
]

interface LevelSummary {
  id: number
  name: string
  sortOrder: number
  active: boolean
}

interface CycleSummary {
  id: number
  name: string
  description: string | null
  active: boolean
  levels: LevelSummary[]
}

interface StudentSummary {
  id: number
  firstName: string
  lastName: string
  fullName: string
  section: string
  notes: string
  active: boolean
  level: LevelSummary
  guardianId: number | null
  studentUserId: number | null
}

@Injectable()
export class AcademicStructureService {
  constructor(
    @InjectRepository(LevelEntity)
    private readonly levelRepository: Repository<LevelEntity>,
    @InjectRepository(CycleEntity)
    private readonly cycleRepository: Repository<CycleEntity>,
    @InjectRepository(CycleLevelEntity)
    private readonly cycleLevelRepository: Repository<CycleLevelEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
    @InjectRepository(CourseStudentEntity)
    private readonly courseStudentRepository: Repository<CourseStudentEntity>,
    @InjectRepository(CourseTeacherEntity)
    private readonly courseTeacherRepository: Repository<CourseTeacherEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async listLevels(): Promise<LevelSummary[]> {
    const levels = await this.levelRepository.find({
      order: {
        sortOrder: 'ASC',
        name: 'ASC'
      }
    })
    return levels.map((level) => this.mapLevel(level))
  }

  async createLevel(request: CreateLevelDto): Promise<LevelSummary> {
    const normalizedName = request.name.trim()
    await this.ensureLevelNameAvailable(normalizedName)

    const level = this.levelRepository.create({
      name: normalizedName,
      sortOrder: request.sortOrder ?? resolveLevelSortOrder(normalizedName),
      active: true
    })
    const created = await this.levelRepository.save(level)
    return this.mapLevel(created)
  }

  async listCycles(): Promise<CycleSummary[]> {
    const cycles = await this.cycleRepository.find({
      order: { name: 'ASC' }
    })
    if (!cycles.length) {
      return []
    }

    const cycleLevels = await this.cycleLevelRepository.find({
      where: cycles.map((cycle) => ({ cycleId: cycle.id }))
    })

    const levelIds = [...new Set(cycleLevels.map((item) => item.levelId))]
    const levels = levelIds.length
      ? await this.levelRepository.find({
          where: levelIds.map((id) => ({ id }))
        })
      : []
    const levelsMap = new Map(levels.map((level) => [level.id, level]))

    const levelsByCycle = new Map<string, string[]>()
    for (const row of cycleLevels) {
      const current = levelsByCycle.get(row.cycleId) ?? []
      current.push(row.levelId)
      levelsByCycle.set(row.cycleId, current)
    }

    return cycles.map((cycle) => ({
      id: Number(cycle.id),
      name: cycle.name,
      description: cycle.description,
      active: cycle.active,
      levels: (levelsByCycle.get(cycle.id) ?? [])
        .map((levelId) => levelsMap.get(levelId))
        .filter((level): level is LevelEntity => Boolean(level))
        .map((level) => this.mapLevel(level))
        .sort((a, b) => a.sortOrder - b.sortOrder)
    }))
  }

  async createCycle(request: CreateCycleDto): Promise<CycleSummary> {
    const normalizedName = request.name.trim()
    await this.ensureCycleNameAvailable(normalizedName)

    const cycle = this.cycleRepository.create({
      name: normalizedName,
      description: request.description?.trim() || null,
      active: true
    })
    const created = await this.cycleRepository.save(cycle)
    return {
      id: Number(created.id),
      name: created.name,
      description: created.description,
      active: created.active,
      levels: []
    }
  }

  async setCycleLevels(cycleId: number, levelIds: number[]): Promise<CycleSummary> {
    const cycle = await this.getCycleOrFail(cycleId)
    const normalizedLevelIds = [...new Set(levelIds.map((id) => String(id)))]

    if (normalizedLevelIds.length > 0) {
      const levels = await this.levelRepository.find({
        where: normalizedLevelIds.map((id) => ({ id }))
      })
      if (levels.length !== normalizedLevelIds.length) {
        throw new BadRequestException('Uno o mas niveles no existen')
      }
    }

    await this.cycleLevelRepository.delete({ cycleId: cycle.id })

    if (normalizedLevelIds.length > 0) {
      const rows = normalizedLevelIds.map((levelId) =>
        this.cycleLevelRepository.create({
          cycleId: cycle.id,
          levelId
        })
      )
      await this.cycleLevelRepository.save(rows)
    }

    return this.getCycleWithLevels(cycle.id)
  }

  async listStudents(filter: StudentsFilterDto, user: JwtPayload): Promise<StudentSummary[]> {
    const query = this.studentRepository
      .createQueryBuilder('student')
      .where('student.active = :active', { active: true })

    if (filter.levelId) {
      query.andWhere('student.levelId = :levelId', { levelId: String(filter.levelId) })
    }
    if (filter.section?.trim()) {
      query.andWhere('student.section = :section', {
        section: filter.section.trim().toUpperCase()
      })
    }

    if (user.role === RoleName.APODERADO) {
      query.andWhere('student.guardianId = :guardianId', { guardianId: String(user.sub) })
    } else if (user.role === RoleName.ESTUDIANTE) {
      query.andWhere('student.studentUserId = :studentUserId', { studentUserId: String(user.sub) })
    } else if (user.role === RoleName.PROFESOR) {
      query
        .innerJoin(CourseStudentEntity, 'courseStudent', 'courseStudent.studentId = student.id')
        .innerJoin(CourseTeacherEntity, 'courseTeacher', 'courseTeacher.courseId = courseStudent.courseId')
        .andWhere('courseTeacher.teacherId = :teacherId', { teacherId: String(user.sub) })
        .distinct(true)
    } else if (user.role !== RoleName.ADMIN && user.role !== RoleName.COLEGIO) {
      throw new ForbiddenException('No tienes permisos para listar alumnos')
    }

    const students = await query
      .orderBy('student.lastName', 'ASC')
      .addOrderBy('student.firstName', 'ASC')
      .getMany()

    if (!students.length) {
      return []
    }

    const levelIds = [...new Set(students.map((student) => student.levelId))]
    const levels = await this.levelRepository.find({
      where: levelIds.map((id) => ({ id }))
    })
    const levelsMap = new Map(levels.map((level) => [level.id, level]))

    const mapped = students
      .map((student) => {
        const level = levelsMap.get(student.levelId)
        if (!level) {
          return null
        }
        return this.mapStudent(student, level)
      })
      .filter((student): student is StudentSummary => Boolean(student))

    return mapped.sort((a, b) => {
      if (a.level.sortOrder !== b.level.sortOrder) {
        return a.level.sortOrder - b.level.sortOrder
      }
      const sectionDiff = a.section.localeCompare(b.section)
      if (sectionDiff !== 0) {
        return sectionDiff
      }
      return a.lastName.localeCompare(b.lastName)
    })
  }

  async createStudent(request: CreateStudentDto): Promise<StudentSummary> {
    const level = await this.getLevelOrFail(request.levelId)
    const guardianId = request.guardianId ? String(request.guardianId) : null
    const studentUserId = request.studentUserId ? String(request.studentUserId) : null

    if (guardianId) {
      const guardian = await this.getUserOrFail(guardianId)
      if (guardian.role !== RoleName.APODERADO) {
        throw new BadRequestException('guardianId debe referenciar un usuario APODERADO')
      }
    }

    if (studentUserId) {
      const studentUser = await this.getUserOrFail(studentUserId)
      if (studentUser.role !== RoleName.ESTUDIANTE) {
        throw new BadRequestException('studentUserId debe referenciar un usuario ESTUDIANTE')
      }

      const alreadyLinked = await this.studentRepository.findOne({
        where: { studentUserId }
      })
      if (alreadyLinked) {
        throw new ConflictException('El usuario estudiante ya tiene ficha academica vinculada')
      }
    }

    const student = this.studentRepository.create({
      firstName: request.firstName.trim(),
      lastName: request.lastName.trim(),
      levelId: level.id,
      section: request.section.trim().toUpperCase(),
      guardianId,
      studentUserId,
      notes: request.notes?.trim() ?? '',
      active: true
    })

    const created = await this.studentRepository.save(student)
    return this.mapStudent(created, level)
  }

  private async getCycleWithLevels(cycleId: string): Promise<CycleSummary> {
    const cycle = await this.cycleRepository.findOne({
      where: { id: cycleId }
    })
    if (!cycle) {
      throw new NotFoundException(`Ciclo ${cycleId} no encontrado`)
    }

    const cycleLevels = await this.cycleLevelRepository.find({
      where: { cycleId: cycle.id }
    })
    const levels = cycleLevels.length
      ? await this.levelRepository.find({
          where: cycleLevels.map((row) => ({ id: row.levelId }))
        })
      : []

    return {
      id: Number(cycle.id),
      name: cycle.name,
      description: cycle.description,
      active: cycle.active,
      levels: levels.map((level) => this.mapLevel(level)).sort((a, b) => a.sortOrder - b.sortOrder)
    }
  }

  private async getCycleOrFail(cycleId: number): Promise<CycleEntity> {
    const cycle = await this.cycleRepository.findOne({
      where: { id: String(cycleId) }
    })
    if (!cycle) {
      throw new NotFoundException(`Ciclo ${cycleId} no encontrado`)
    }
    return cycle
  }

  private async getLevelOrFail(levelId: number): Promise<LevelEntity> {
    const level = await this.levelRepository.findOne({
      where: { id: String(levelId) }
    })
    if (!level) {
      throw new NotFoundException(`Nivel ${levelId} no encontrado`)
    }
    return level
  }

  private async getUserOrFail(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    })
    if (!user) {
      throw new NotFoundException(`Usuario ${userId} no encontrado`)
    }
    return user
  }

  private async ensureLevelNameAvailable(name: string): Promise<void> {
    const existing = await this.levelRepository
      .createQueryBuilder('level')
      .where('LOWER(level.name) = LOWER(:name)', { name })
      .getOne()
    if (existing) {
      throw new ConflictException(`Ya existe el nivel "${name}"`)
    }
  }

  private async ensureCycleNameAvailable(name: string): Promise<void> {
    const existing = await this.cycleRepository
      .createQueryBuilder('cycle')
      .where('LOWER(cycle.name) = LOWER(:name)', { name })
      .getOne()
    if (existing) {
      throw new ConflictException(`Ya existe el ciclo "${name}"`)
    }
  }

  private mapLevel(level: LevelEntity): LevelSummary {
    return {
      id: Number(level.id),
      name: level.name,
      sortOrder: level.sortOrder,
      active: level.active
    }
  }

  private mapStudent(student: StudentEntity, level: LevelEntity): StudentSummary {
    return {
      id: Number(student.id),
      firstName: student.firstName,
      lastName: student.lastName,
      fullName: `${student.firstName} ${student.lastName}`,
      section: student.section,
      notes: student.notes,
      active: student.active,
      level: this.mapLevel(level),
      guardianId: student.guardianId ? Number(student.guardianId) : null,
      studentUserId: student.studentUserId ? Number(student.studentUserId) : null
    }
  }
}

function resolveLevelSortOrder(name: string): number {
  const index = CHILE_LEVELS_ORDER.findIndex((candidate) => candidate.toLowerCase() === name.toLowerCase())
  return index >= 0 ? index : 99
}
