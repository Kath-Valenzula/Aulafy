import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { JwtPayload } from '../common/auth/jwt-payload.interface'
import { AcademicAccessService } from '../common/access/academic-access.service'
import { StudentEntity } from '../academic-structure/entities/student.entity'
import { LevelEntity } from '../academic-structure/entities/level.entity'
import { CycleEntity } from '../academic-structure/entities/cycle.entity'
import { UserEntity } from '../users/entities/user.entity'
import { RoleName } from '../users/enums/role-name.enum'
import { Repository } from 'typeorm'
import { CreateCourseDto } from './dto/create-course.dto'
import { CreateSubjectDto } from './dto/create-subject.dto'
import { CourseEntity } from './entities/course.entity'
import { CourseStudentEntity } from './entities/course-student.entity'
import { CourseTeacherEntity } from './entities/course-teacher.entity'
import { SubjectEntity } from './entities/subject.entity'

interface CourseResponse {
  id: number
  name: string
  level: string
  section: string
  schoolName: string
  active: boolean
  studentCount: number
  teacherCount: number
  myRoleInCourse?: string | null
  myRoleLabel?: string | null
}

interface CourseTeacherResponse {
  teacherId: number
  teacherName: string
  roleInCourse: string
  roleLabel: string
}

interface SubjectResponse {
  id: number
  name: string
  courseId: number
  courseName: string
  teacherId: number | null
  teacherName: string | null
  active: boolean
}

interface CourseStudentResponse {
  id: number
  firstName: string
  lastName: string
  fullName: string
  levelName: string
  section: string
  guardianId: number | null
  studentUserId: number | null
}

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    @InjectRepository(CourseStudentEntity)
    private readonly courseStudentRepository: Repository<CourseStudentEntity>,
    @InjectRepository(CourseTeacherEntity)
    private readonly courseTeacherRepository: Repository<CourseTeacherEntity>,
    @InjectRepository(SubjectEntity)
    private readonly subjectRepository: Repository<SubjectEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(LevelEntity)
    private readonly levelRepository: Repository<LevelEntity>,
    @InjectRepository(CycleEntity)
    private readonly cycleRepository: Repository<CycleEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
    private readonly accessService: AcademicAccessService
  ) {}

  async findVisible(user: JwtPayload): Promise<CourseResponse[]> {
    const courses = await this.findCoursesByVisibility(user)
    if (!courses.length) {
      return []
    }

    const courseIds = courses.map((course) => Number(course.id))
    const [studentCounts, teacherCounts, roleMap] = await Promise.all([
      this.countStudentsByCourse(courseIds),
      this.countTeachersByCourse(courseIds),
      user.role === RoleName.PROFESOR
        ? this.findRolesByCourseForTeacher(courseIds, user.sub)
        : Promise.resolve(new Map<number, string>())
    ])

    return courses.map((course) => {
      const id = Number(course.id)
      const myRoleInCourse = roleMap.get(id) ?? null
      const response: CourseResponse = {
        id,
        name: course.name,
        level: course.level,
        section: course.section,
        schoolName: course.schoolName,
        active: course.active,
        studentCount: studentCounts.get(id) ?? 0,
        teacherCount: teacherCounts.get(id) ?? 0
      }
      if (user.role === RoleName.PROFESOR) {
        response.myRoleInCourse = myRoleInCourse
        response.myRoleLabel = myRoleInCourse ? this.roleLabelFor(myRoleInCourse) : null
      }
      return response
    })
  }

  async findById(id: number, user: JwtPayload): Promise<CourseResponse> {
    await this.accessService.assertCanViewCourse(user, id)
    const course = await this.findCourseOrFail(id)
    const [studentCount, teacherCount] = await Promise.all([
      this.courseStudentRepository.count({ where: { courseId: course.id } }),
      this.courseTeacherRepository.count({ where: { courseId: course.id } })
    ])

    const response: CourseResponse = {
      id: Number(course.id),
      name: course.name,
      level: course.level,
      section: course.section,
      schoolName: course.schoolName,
      active: course.active,
      studentCount,
      teacherCount
    }

    if (user.role === RoleName.PROFESOR) {
      const assignment = await this.courseTeacherRepository.findOne({
        where: { courseId: course.id, teacherId: String(user.sub) }
      })
      response.myRoleInCourse = assignment?.roleInCourse ?? null
      response.myRoleLabel = assignment ? this.roleLabelFor(assignment.roleInCourse) : null
    }

    return response
  }

  async findTeachersByCourse(courseId: number, user: JwtPayload): Promise<CourseTeacherResponse[]> {
    await this.accessService.assertCanViewCourse(user, courseId)
    await this.findCourseOrFail(courseId)

    const assignments = await this.courseTeacherRepository.find({
      where: { courseId: String(courseId) }
    })
    if (!assignments.length) {
      return []
    }

    const teachers = await this.userRepository.find({
      where: assignments.map((a) => ({ id: a.teacherId }))
    })
    const teachersMap = new Map(teachers.map((t) => [t.id, t]))

    return assignments.map((a) => ({
      teacherId: Number(a.teacherId),
      teacherName: teachersMap.get(a.teacherId)?.fullName ?? 'Docente',
      roleInCourse: a.roleInCourse,
      roleLabel: this.roleLabelFor(a.roleInCourse)
    }))
  }

  async create(request: CreateCourseDto): Promise<CourseResponse> {
    if (request.levelId) {
      await this.ensureLevelExists(request.levelId)
    }
    if (request.cycleId) {
      await this.ensureCycleExists(request.cycleId)
    }

    const course = this.courseRepository.create({
      name: request.name.trim(),
      level: request.level.trim(),
      section: request.section.trim().toUpperCase(),
      schoolName: request.schoolName.trim(),
      levelId: request.levelId ? String(request.levelId) : null,
      cycleId: request.cycleId ? String(request.cycleId) : null,
      active: true
    })
    const created = await this.courseRepository.save(course)

    return {
      id: Number(created.id),
      name: created.name,
      level: created.level,
      section: created.section,
      schoolName: created.schoolName,
      active: created.active,
      studentCount: 0,
      teacherCount: 0
    }
  }

  async addStudent(courseId: number, studentId: number): Promise<CourseResponse> {
    const course = await this.findCourseOrFail(courseId)
    await this.ensureStudentExists(studentId)

    const existing = await this.courseStudentRepository.findOne({
      where: { courseId: course.id, studentId: String(studentId) }
    })
    if (!existing) {
      await this.courseStudentRepository.save({
        courseId: course.id,
        studentId: String(studentId)
      })
    }

    return this.buildCourseResponse(course)
  }

  async addTeacher(courseId: number, teacherId: number): Promise<CourseResponse> {
    const course = await this.findCourseOrFail(courseId)
    const teacher = await this.userRepository.findOne({
      where: { id: String(teacherId) }
    })
    if (!teacher) {
      throw new NotFoundException(`Usuario ${teacherId} no encontrado`)
    }
    if (teacher.role !== RoleName.PROFESOR) {
      throw new BadRequestException('El usuario seleccionado no tiene rol PROFESOR')
    }

    const existing = await this.courseTeacherRepository.findOne({
      where: { courseId: course.id, teacherId: String(teacherId) }
    })
    if (!existing) {
      await this.courseTeacherRepository.save({
        courseId: course.id,
        teacherId: String(teacherId)
      })
    }

    return this.buildCourseResponse(course)
  }

  async findSubjectsByCourse(courseId: number, user: JwtPayload): Promise<SubjectResponse[]> {
    await this.accessService.assertCanViewCourse(user, courseId)
    const course = await this.findCourseOrFail(courseId)
    const subjects = await this.subjectRepository.find({
      where: { courseId: course.id },
      order: { name: 'ASC' }
    })

    if (!subjects.length) {
      return []
    }

    const teacherIds = [
      ...new Set(
        subjects
          .map((subject) => subject.teacherId)
          .filter((teacherId): teacherId is string => Boolean(teacherId))
      )
    ]

    const teachers = teacherIds.length
      ? await this.userRepository.find({
          where: teacherIds.map((id) => ({ id }))
        })
      : []
    const teachersMap = new Map(teachers.map((teacher) => [teacher.id, teacher]))

    return subjects.map((subject) => ({
      id: Number(subject.id),
      name: subject.name,
      courseId: Number(subject.courseId),
      courseName: course.name,
      teacherId: subject.teacherId ? Number(subject.teacherId) : null,
      teacherName: subject.teacherId ? (teachersMap.get(subject.teacherId)?.fullName ?? null) : null,
      active: subject.active
    }))
  }

  async findStudentsByCourse(courseId: number, user: JwtPayload): Promise<CourseStudentResponse[]> {
    await this.accessService.assertCanViewCourse(user, courseId)
    await this.findCourseOrFail(courseId)

    const courseStudents = await this.courseStudentRepository.find({
      where: { courseId: String(courseId) }
    })
    if (!courseStudents.length) {
      return []
    }

    const studentIds = courseStudents.map((row) => row.studentId)
    const students = await this.studentRepository.find({
      where: studentIds.map((id) => ({ id, active: true })),
      order: { lastName: 'ASC', firstName: 'ASC' }
    })
    if (!students.length) {
      return []
    }

    const visibleStudents = this.filterStudentsByUser(students, user)
    if (!visibleStudents.length) {
      return []
    }

    const levels = await this.levelRepository.find({
      where: [...new Set(visibleStudents.map((student) => student.levelId))].map((id) => ({ id }))
    })
    const levelsMap = new Map(levels.map((level) => [level.id, level]))

    const isSubjectTeacherRole =
      user.role === RoleName.PROFESOR &&
      (await this.accessService.getTeacherRoleInCourse(courseId, user.sub)) !== 'HEAD_TEACHER'

    return visibleStudents.map((student) => ({
      id: Number(student.id),
      firstName: student.firstName,
      lastName: student.lastName,
      fullName: `${student.firstName} ${student.lastName}`.trim(),
      levelName: levelsMap.get(student.levelId)?.name ?? 'Nivel',
      section: student.section,
      guardianId: isSubjectTeacherRole ? null : (student.guardianId ? Number(student.guardianId) : null),
      studentUserId: isSubjectTeacherRole ? null : (student.studentUserId ? Number(student.studentUserId) : null)
    }))
  }

  async createSubject(request: CreateSubjectDto, user: JwtPayload): Promise<SubjectResponse> {
    await this.accessService.assertCanManageCourse(user, request.courseId)

    const course = await this.findCourseOrFail(request.courseId)
    let teacher: UserEntity | null = null

    if (request.teacherId) {
      teacher = await this.userRepository.findOne({
        where: { id: String(request.teacherId) }
      })
      if (!teacher) {
        throw new NotFoundException(`Usuario ${request.teacherId} no encontrado`)
      }
      if (teacher.role !== RoleName.PROFESOR) {
        throw new BadRequestException('teacherId debe referenciar un usuario PROFESOR')
      }
    }

    const existing = await this.subjectRepository
      .createQueryBuilder('subject')
      .where('subject.courseId = :courseId', { courseId: course.id })
      .andWhere('LOWER(subject.name) = LOWER(:name)', { name: request.name.trim() })
      .getOne()

    if (existing) {
      throw new ConflictException('Ya existe una asignatura con ese nombre en este curso')
    }

    const subject = this.subjectRepository.create({
      name: request.name.trim(),
      courseId: course.id,
      teacherId: teacher ? teacher.id : null,
      active: request.active ?? true
    })
    const created = await this.subjectRepository.save(subject)

    return {
      id: Number(created.id),
      name: created.name,
      courseId: Number(created.courseId),
      courseName: course.name,
      teacherId: created.teacherId ? Number(created.teacherId) : null,
      teacherName: teacher?.fullName ?? null,
      active: created.active
    }
  }

  async findCourseOrFail(id: number): Promise<CourseEntity> {
    const course = await this.courseRepository.findOne({ where: { id: String(id), active: true } })
    if (!course) {
      throw new NotFoundException(`Curso ${id} no encontrado`)
    }
    return course
  }

  private async buildCourseResponse(course: CourseEntity): Promise<CourseResponse> {
    const [studentCount, teacherCount] = await Promise.all([
      this.courseStudentRepository.count({ where: { courseId: course.id } }),
      this.courseTeacherRepository.count({ where: { courseId: course.id } })
    ])
    return {
      id: Number(course.id),
      name: course.name,
      level: course.level,
      section: course.section,
      schoolName: course.schoolName,
      active: course.active,
      studentCount,
      teacherCount
    }
  }

  private async findCoursesByVisibility(user: JwtPayload): Promise<CourseEntity[]> {
    if (user.role === RoleName.ADMIN || user.role === RoleName.COLEGIO) {
      return this.courseRepository.find({
        where: { active: true },
        order: { name: 'ASC' }
      })
    }

    const visibleCourseIds = await this.accessService.findVisibleCourseIds(user)
    if (!visibleCourseIds.length) {
      return []
    }

    return this.courseRepository.find({
      where: visibleCourseIds.map((id) => ({
        id: String(id),
        active: true
      })),
      order: { name: 'ASC' }
    })
  }

  private async countStudentsByCourse(courseIds: number[]): Promise<Map<number, number>> {
    const rows = await this.courseStudentRepository
      .createQueryBuilder('courseStudent')
      .select('courseStudent.courseId', 'courseId')
      .addSelect('COUNT(*)', 'total')
      .where('courseStudent.courseId IN (:...courseIds)', { courseIds: courseIds.map(String) })
      .groupBy('courseStudent.courseId')
      .getRawMany<{ courseId: string; total: string }>()

    return new Map(rows.map((row) => [Number(row.courseId), Number(row.total)]))
  }

  private async countTeachersByCourse(courseIds: number[]): Promise<Map<number, number>> {
    const rows = await this.courseTeacherRepository
      .createQueryBuilder('courseTeacher')
      .select('courseTeacher.courseId', 'courseId')
      .addSelect('COUNT(*)', 'total')
      .where('courseTeacher.courseId IN (:...courseIds)', { courseIds: courseIds.map(String) })
      .groupBy('courseTeacher.courseId')
      .getRawMany<{ courseId: string; total: string }>()

    return new Map(rows.map((row) => [Number(row.courseId), Number(row.total)]))
  }

  private async ensureLevelExists(levelId: number): Promise<void> {
    const level = await this.levelRepository.findOne({
      where: { id: String(levelId), active: true }
    })
    if (!level) {
      throw new BadRequestException(`Nivel ${levelId} no existe`)
    }
  }

  private async ensureCycleExists(cycleId: number): Promise<void> {
    const cycle = await this.cycleRepository.findOne({
      where: { id: String(cycleId), active: true }
    })
    if (!cycle) {
      throw new BadRequestException(`Ciclo ${cycleId} no existe`)
    }
  }

  private async ensureStudentExists(studentId: number): Promise<void> {
    const exists = await this.studentRepository.findOne({
      where: { id: String(studentId), active: true }
    })
    if (!exists) {
      throw new NotFoundException(`Alumno ${studentId} no encontrado`)
    }
  }

  private filterStudentsByUser(students: StudentEntity[], user: JwtPayload): StudentEntity[] {
    if (user.role === RoleName.APODERADO) {
      return students.filter((student) => student.guardianId === String(user.sub))
    }

    if (user.role === RoleName.ESTUDIANTE) {
      return students.filter((student) => student.studentUserId === String(user.sub))
    }

    return students
  }

  private roleLabelFor(roleInCourse: string): string {
    if (roleInCourse === 'HEAD_TEACHER') return 'Profesor jefe'
    if (roleInCourse === 'ASSISTANT') return 'Asistente'
    return 'Profesor de asignatura'
  }

  private async findRolesByCourseForTeacher(courseIds: number[], teacherId: number): Promise<Map<number, string>> {
    if (!courseIds.length) return new Map()
    const rows = await this.courseTeacherRepository.find({
      where: courseIds.map((id) => ({ courseId: String(id), teacherId: String(teacherId) }))
    })
    return new Map(rows.map((row) => [Number(row.courseId), row.roleInCourse]))
  }
}
