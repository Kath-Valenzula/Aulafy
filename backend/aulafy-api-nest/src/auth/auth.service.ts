import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from '../common/auth/jwt-payload.interface';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async login(request: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmail(request.email);
    if (!user || !user.active) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const passwordMatches = await bcrypt.compare(request.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    // El payload replica el contrato de identidad usado por el frontend actual.
    const payload: JwtPayload = {
      sub: Number(user.id),
      email: user.email,
      role: user.role
    };

    const token = await this.jwtService.signAsync(payload);
    const profile = await this.usersService.findById(Number(user.id));

    return {
      token,
      tokenType: 'Bearer',
      user: profile
    };
  }

  async me(userId: number): Promise<LoginResponseDto['user']> {
    return this.usersService.findById(userId);
  }
}
