import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';
import { RequestWithUser } from './request-with-user.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Token JWT no proporcionado');
    }

    try {
      // Se adjunta el payload al request para usarlo en controladores y guardias de rol.
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET')
      });
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token JWT invalido');
    }
  }
}

function extractBearerToken(request: RequestWithUser): string | null {
  const authorization = request.headers.authorization;
  if (!authorization) {
    return null;
  }

  const [type, token] = authorization.split(' ');
  if (type !== 'Bearer' || !token) {
    return null;
  }
  return token;
}
