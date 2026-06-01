import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../common/auth/current-user.decorator'
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard'
import { JwtPayload } from '../common/auth/jwt-payload.interface'
import { Roles } from '../common/auth/roles.decorator'
import { RolesGuard } from '../common/auth/roles.guard'
import { RoleName } from '../users/enums/role-name.enum'
import { AcademicService } from './academic.service'
import { CreateEvaluationDto } from './dto/create-evaluation.dto'
import { CreateGradeDto } from './dto/create-grade.dto'

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AcademicController {
  constructor(private readonly academicService: AcademicService) {}

  @Get('students/:studentId/grades')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO, RoleName.PROFESOR, RoleName.APODERADO, RoleName.ESTUDIANTE)
  findByStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @CurrentUser() user: JwtPayload
  ) {
    return this.academicService.findGradesByStudent(studentId, user)
  }

  @Post('grades')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO, RoleName.PROFESOR)
  createGrade(@Body() request: CreateGradeDto, @CurrentUser() user: JwtPayload) {
    return this.academicService.createGrade(request, user)
  }

  @Get('students/:studentId/academic-summary')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO, RoleName.PROFESOR, RoleName.APODERADO, RoleName.ESTUDIANTE)
  summary(@Param('studentId', ParseIntPipe) studentId: number, @CurrentUser() user: JwtPayload) {
    return this.academicService.summary(studentId, user)
  }

  @Get('courses/:courseId/evaluations')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO, RoleName.PROFESOR, RoleName.APODERADO, RoleName.ESTUDIANTE)
  findEvaluations(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUser() user: JwtPayload
  ) {
    return this.academicService.findEvaluationsByCourse(courseId, user)
  }

  @Post('evaluations')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO, RoleName.PROFESOR)
  createEvaluation(@Body() request: CreateEvaluationDto, @CurrentUser() user: JwtPayload) {
    return this.academicService.createEvaluation(request, user)
  }
}
