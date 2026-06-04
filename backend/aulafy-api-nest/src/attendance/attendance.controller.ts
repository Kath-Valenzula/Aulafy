import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../common/auth/current-user.decorator'
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard'
import { JwtPayload } from '../common/auth/jwt-payload.interface'
import { Roles } from '../common/auth/roles.decorator'
import { RolesGuard } from '../common/auth/roles.guard'
import { RoleName } from '../users/enums/role-name.enum'
import { AttendanceService } from './attendance.service'
import { CreateAttendanceDto } from './dto/create-attendance.dto'

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('students/:studentId/attendance')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO, RoleName.PROFESOR, RoleName.APODERADO, RoleName.ESTUDIANTE)
  findByStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @CurrentUser() user: JwtPayload
  ) {
    return this.attendanceService.findByStudent(studentId, user)
  }

  @Post('attendance')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO, RoleName.PROFESOR)
  create(@Body() request: CreateAttendanceDto, @CurrentUser() user: JwtPayload) {
    return this.attendanceService.create(request, user)
  }

  @Get('students/:studentId/attendance-summary')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO, RoleName.PROFESOR, RoleName.APODERADO, RoleName.ESTUDIANTE)
  summary(@Param('studentId', ParseIntPipe) studentId: number, @CurrentUser() user: JwtPayload) {
    return this.attendanceService.summary(studentId, user)
  }
}
