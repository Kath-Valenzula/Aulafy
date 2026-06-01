import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../common/auth/current-user.decorator'
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard'
import { JwtPayload } from '../common/auth/jwt-payload.interface'
import { Roles } from '../common/auth/roles.decorator'
import { RolesGuard } from '../common/auth/roles.guard'
import { RoleName } from '../users/enums/role-name.enum'
import { AnnotationsQueryDto } from './dto/annotations-query.dto'
import { CreateAnnotationDto } from './dto/create-annotation.dto'
import { AnnotationsService } from './annotations.service'

@Controller('annotations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnnotationsController {
  constructor(private readonly annotationsService: AnnotationsService) {}

  @Get()
  @Roles(RoleName.ADMIN, RoleName.COLEGIO, RoleName.PROFESOR, RoleName.APODERADO, RoleName.ESTUDIANTE)
  list(@Query() query: AnnotationsQueryDto, @CurrentUser() user: JwtPayload) {
    return this.annotationsService.list(query, user)
  }

  @Get('students/:studentId')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO, RoleName.PROFESOR, RoleName.APODERADO, RoleName.ESTUDIANTE)
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number, @CurrentUser() user: JwtPayload) {
    return this.annotationsService.findByStudent(studentId, user)
  }

  @Post()
  @Roles(RoleName.ADMIN, RoleName.COLEGIO, RoleName.PROFESOR)
  create(@Body() request: CreateAnnotationDto, @CurrentUser() user: JwtPayload) {
    return this.annotationsService.create(request, user)
  }
}
