import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../common/auth/current-user.decorator'
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard'
import { JwtPayload } from '../common/auth/jwt-payload.interface'
import { Roles } from '../common/auth/roles.decorator'
import { RolesGuard } from '../common/auth/roles.guard'
import { RoleName } from '../users/enums/role-name.enum'
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto'
import { CalendarService } from './calendar.service'

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('courses/:courseId/events')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO, RoleName.PROFESOR, RoleName.APODERADO, RoleName.ESTUDIANTE)
  findEvents(@Param('courseId', ParseIntPipe) courseId: number, @CurrentUser() user: JwtPayload) {
    return this.calendarService.findByCourse(courseId, user)
  }

  @Post('courses/:courseId/events')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO, RoleName.PROFESOR)
  createEvent(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() request: CreateCalendarEventDto,
    @CurrentUser() user: JwtPayload
  ) {
    return this.calendarService.create(courseId, request, user)
  }
}
