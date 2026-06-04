import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../common/auth/current-user.decorator'
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard'
import { JwtPayload } from '../common/auth/jwt-payload.interface'
import { Roles } from '../common/auth/roles.decorator'
import { RolesGuard } from '../common/auth/roles.guard'
import { RoleName } from '../users/enums/role-name.enum'
import { CreateCourseDto } from './dto/create-course.dto'
import { CreateSubjectDto } from './dto/create-subject.dto'
import { CoursesService } from './courses.service'

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get('courses')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO, RoleName.PROFESOR, RoleName.APODERADO, RoleName.ESTUDIANTE)
  findVisible(@CurrentUser() user: JwtPayload) {
    return this.coursesService.findVisible(user)
  }

  @Get('courses/:id')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO, RoleName.PROFESOR, RoleName.APODERADO, RoleName.ESTUDIANTE)
  findById(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    return this.coursesService.findById(id, user)
  }

  @Post('courses')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO)
  create(@Body() request: CreateCourseDto) {
    return this.coursesService.create(request)
  }

  @Post('courses/:id/students/:studentId')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO)
  addStudent(
    @Param('id', ParseIntPipe) id: number,
    @Param('studentId', ParseIntPipe) studentId: number
  ) {
    return this.coursesService.addStudent(id, studentId)
  }

  @Post('courses/:id/teachers/:teacherId')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO)
  addTeacher(
    @Param('id', ParseIntPipe) id: number,
    @Param('teacherId', ParseIntPipe) teacherId: number
  ) {
    return this.coursesService.addTeacher(id, teacherId)
  }

  @Get('courses/:courseId/subjects')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO, RoleName.PROFESOR, RoleName.APODERADO, RoleName.ESTUDIANTE)
  findByCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUser() user: JwtPayload
  ) {
    return this.coursesService.findSubjectsByCourse(courseId, user)
  }

  @Get('courses/:courseId/students')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO, RoleName.PROFESOR, RoleName.APODERADO, RoleName.ESTUDIANTE)
  findStudentsByCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUser() user: JwtPayload
  ) {
    return this.coursesService.findStudentsByCourse(courseId, user)
  }

  @Post('subjects')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO, RoleName.PROFESOR)
  createSubject(@Body() request: CreateSubjectDto, @CurrentUser() user: JwtPayload) {
    return this.coursesService.createSubject(request, user)
  }
}
