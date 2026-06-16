import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { JwtPayload } from '../common/auth/jwt-payload.interface';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { UserCreateDto } from './dto/user-create.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserStatusDto } from './dto/user-status.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { RoleName } from './enums/role-name.enum';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN, RoleName.COLEGIO)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload): Promise<UserResponseDto[]> {
    return this.usersService.findVisible(user);
  }

  @Get(':id')
  findById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload
  ): Promise<UserResponseDto> {
    return this.usersService.findVisibleById(id, user);
  }

  @Post()
  @Roles(RoleName.ADMIN)
  create(@Body() request: UserCreateDto): Promise<UserResponseDto> {
    return this.usersService.create(request);
  }

  @Put(':id')
  @Roles(RoleName.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() request: UserUpdateDto
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, request);
  }

  @Patch(':id/status')
  @Roles(RoleName.ADMIN)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() request: UserStatusDto
  ): Promise<UserResponseDto> {
    return this.usersService.updateStatus(id, request);
  }
}
