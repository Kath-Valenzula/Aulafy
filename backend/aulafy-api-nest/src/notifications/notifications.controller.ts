import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../common/auth/current-user.decorator'
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard'
import { JwtPayload } from '../common/auth/jwt-payload.interface'
import { Roles } from '../common/auth/roles.decorator'
import { RolesGuard } from '../common/auth/roles.guard'
import { RoleName } from '../users/enums/role-name.enum'
import { LogsQueryDto } from './dto/logs-query.dto'
import { SendTelegramDto } from './dto/send-telegram.dto'
import { NotificationsService } from './notifications.service'

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN, RoleName.COLEGIO, RoleName.PROFESOR)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('logs')
  listLogs(@Query() query: LogsQueryDto) {
    return this.notificationsService.listLogs(query.limit ?? 50)
  }

  @Post('telegram/test')
  testTelegram(@CurrentUser() user: JwtPayload) {
    return this.notificationsService.sendTest(user.sub)
  }

  @Post('telegram/send')
  sendTelegram(@Body() request: SendTelegramDto, @CurrentUser() user: JwtPayload) {
    return this.notificationsService.sendMessage(user.sub, request.message, request.chatId ?? null)
  }
}
