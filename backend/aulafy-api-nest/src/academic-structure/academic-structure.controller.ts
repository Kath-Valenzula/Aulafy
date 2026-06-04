import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../common/auth/current-user.decorator'
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard'
import { JwtPayload } from '../common/auth/jwt-payload.interface'
import { Roles } from '../common/auth/roles.decorator'
import { RolesGuard } from '../common/auth/roles.guard'
import { RoleName } from '../users/enums/role-name.enum'
import { AcademicStructureService } from './academic-structure.service'
import { CreateCycleDto } from './dto/create-cycle.dto'
import { CreateLevelDto } from './dto/create-level.dto'
import { CreateStudentDto } from './dto/create-student.dto'
import { SetCycleLevelsDto } from './dto/set-cycle-levels.dto'
import { StudentsFilterDto } from './dto/students-filter.dto'

@Controller('academic-structure')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AcademicStructureController {
  constructor(private readonly academicStructureService: AcademicStructureService) {}

  @Get('levels')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO, RoleName.PROFESOR)
  listLevels() {
    return this.academicStructureService.listLevels()
  }

  @Post('levels')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO)
  createLevel(@Body() request: CreateLevelDto) {
    return this.academicStructureService.createLevel(request)
  }

  @Get('cycles')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO, RoleName.PROFESOR)
  listCycles() {
    return this.academicStructureService.listCycles()
  }

  @Post('cycles')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO)
  createCycle(@Body() request: CreateCycleDto) {
    return this.academicStructureService.createCycle(request)
  }

  @Put('cycles/:id/levels')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO)
  setCycleLevels(@Param('id', ParseIntPipe) id: number, @Body() request: SetCycleLevelsDto) {
    return this.academicStructureService.setCycleLevels(id, request.levelIds)
  }

  @Get('students')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO, RoleName.PROFESOR, RoleName.APODERADO, RoleName.ESTUDIANTE)
  listStudents(@Query() query: StudentsFilterDto, @CurrentUser() user: JwtPayload) {
    return this.academicStructureService.listStudents(query, user)
  }

  @Post('students')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO)
  createStudent(@Body() request: CreateStudentDto) {
    return this.academicStructureService.createStudent(request)
  }
}
