import { ForbiddenException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { JwtPayload } from '../auth/jwt-payload.interface'
import { RoleName } from '../../users/enums/role-name.enum'
import { Repository } from 'typeorm'
import { StudentEntity } from '../../academic-structure/entities/student.entity'
import { CourseStudentEntity } from '../../courses/entities/course-student.entity'
import { CourseTeacherEntity } from '../../courses/entities/course-teacher.entity'

@Injectable()
export class AcademicAccessService {
  constructor(
    @InjectRepository(CourseStudentEntity)
    private readonly courseStudentRepository: Repository<CourseStudentEntity>,
    @InjectRepository(CourseTeacherEntity)
    private readonly courseTeacherRepository: Repository<CourseTeacherEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>
  ) {}

  async assertCanViewCourse(user: JwtPayload, courseId: number): Promise<void> {
    const canView = await this.canViewCourse(user, courseId)
    if (!canView) {
      throw new ForbiddenException('No tienes permiso para ver este curso')
    }
  }

  async assertCanManageCourse(user: JwtPayload, courseId: number): Promise<void> {
    if (isAdminOrSchool(user.role)) {
      return
    }
    if (
      user.role === RoleName.PROFESOR &&
      (await this.existsTeacherInCourse(courseId, user.sub))
    ) {
      return
    }
    throw new ForbiddenException('No tienes permiso para administrar este curso')
  }

  async assertCanViewStudent(user: JwtPayload, studentId: number): Promise<void> {
    const canView = await this.canViewStudent(user, studentId)
    if (!canView) {
      throw new ForbiddenException('No tienes permiso para ver informacion de este estudiante')
    }
  }

  async assertCanManageStudentRecord(user: JwtPayload, studentId: number, courseId: number): Promise<void> {
    if (isAdminOrSchool(user.role)) {
      return
    }

    if (
      user.role === RoleName.PROFESOR &&
      (await this.existsTeacherInCourse(courseId, user.sub)) &&
      (await this.existsStudentInCourse(courseId, studentId))
    ) {
      return
    }

    throw new ForbiddenException('No tienes permiso para registrar informacion academica de este estudiante')
  }

  async findVisibleCourseIds(user: JwtPayload): Promise<number[]> {
    if (isAdminOrSchool(user.role)) {
      return []
    }

    if (user.role === RoleName.PROFESOR) {
      const rows = await this.courseTeacherRepository.find({
        where: { teacherId: String(user.sub) }
      })
      return rows.map((row) => Number(row.courseId))
    }

    const students = await this.findStudentsForUser(user)
    if (!students.length) {
      return []
    }

    const rows = await this.courseStudentRepository.find({
      where: students.map((studentId) => ({ studentId: String(studentId) }))
    })
    return [...new Set(rows.map((row) => Number(row.courseId)))]
  }

  private async canViewCourse(user: JwtPayload, courseId: number): Promise<boolean> {
    if (isAdminOrSchool(user.role)) {
      return true
    }

    if (user.role === RoleName.PROFESOR) {
      return this.existsTeacherInCourse(courseId, user.sub)
    }

    const studentIds = await this.findStudentsForUser(user)
    if (!studentIds.length) {
      return false
    }

    const count = await this.courseStudentRepository.count({
      where: studentIds.map((studentId) => ({
        courseId: String(courseId),
        studentId: String(studentId)
      }))
    })
    return count > 0
  }

  private async canViewStudent(user: JwtPayload, studentId: number): Promise<boolean> {
    if (isAdminOrSchool(user.role)) {
      return true
    }

    if (user.role === RoleName.ESTUDIANTE) {
      const count = await this.studentRepository.count({
        where: { id: String(studentId), studentUserId: String(user.sub) }
      })
      return count > 0
    }

    if (user.role === RoleName.APODERADO) {
      const count = await this.studentRepository.count({
        where: { id: String(studentId), guardianId: String(user.sub) }
      })
      return count > 0
    }

    if (user.role === RoleName.PROFESOR) {
      const count = await this.courseStudentRepository
        .createQueryBuilder('courseStudent')
        .innerJoin(
          CourseTeacherEntity,
          'courseTeacher',
          'courseTeacher.courseId = courseStudent.courseId'
        )
        .where('courseStudent.studentId = :studentId', { studentId: String(studentId) })
        .andWhere('courseTeacher.teacherId = :teacherId', { teacherId: String(user.sub) })
        .getCount()
      return count > 0
    }

    return false
  }

  private async existsTeacherInCourse(courseId: number, teacherId: number): Promise<boolean> {
    const count = await this.courseTeacherRepository.count({
      where: { courseId: String(courseId), teacherId: String(teacherId) }
    })
    return count > 0
  }

  private async existsStudentInCourse(courseId: number, studentId: number): Promise<boolean> {
    const count = await this.courseStudentRepository.count({
      where: { courseId: String(courseId), studentId: String(studentId) }
    })
    return count > 0
  }

  private async findStudentsForUser(user: JwtPayload): Promise<number[]> {
    if (user.role === RoleName.ESTUDIANTE) {
      const rows = await this.studentRepository.find({
        where: { studentUserId: String(user.sub) }
      })
      return rows.map((row) => Number(row.id))
    }

    if (user.role === RoleName.APODERADO) {
      const rows = await this.studentRepository.find({
        where: { guardianId: String(user.sub) }
      })
      return rows.map((row) => Number(row.id))
    }

    return []
  }
}

function isAdminOrSchool(role: RoleName): boolean {
  return role === RoleName.ADMIN || role === RoleName.COLEGIO
}
