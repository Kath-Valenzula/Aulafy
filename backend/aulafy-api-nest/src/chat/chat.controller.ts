import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../common/auth/current-user.decorator'
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard'
import { JwtPayload } from '../common/auth/jwt-payload.interface'
import { Roles } from '../common/auth/roles.decorator'
import { RolesGuard } from '../common/auth/roles.guard'
import { RoleName } from '../users/enums/role-name.enum'
import { CreateChatMessageDto } from './dto/create-chat-message.dto'
import { CreateChatRoomDto } from './dto/create-chat-room.dto'
import { ChatService } from './chat.service'

@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN, RoleName.COLEGIO, RoleName.PROFESOR, RoleName.APODERADO, RoleName.ESTUDIANTE)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  findRooms(@CurrentUser() user: JwtPayload) {
    return this.chatService.listRooms(user)
  }

  @Post('rooms')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO, RoleName.PROFESOR)
  createRoom(@Body() request: CreateChatRoomDto, @CurrentUser() user: JwtPayload) {
    return this.chatService.createRoom(request, user)
  }

  @Get('rooms/:roomId/messages')
  findMessages(@Param('roomId', ParseIntPipe) roomId: number, @CurrentUser() user: JwtPayload) {
    return this.chatService.findMessagesByRoom(roomId, user)
  }

  @Post('rooms/:roomId/messages')
  createMessage(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body() request: CreateChatMessageDto,
    @CurrentUser() user: JwtPayload
  ) {
    return this.chatService.createMessage(roomId, request, user)
  }
}
