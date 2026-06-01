import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  getHealth(): { status: string; app: string; environment: string } {
    return {
      status: 'UP',
      app: 'Aulafy API Nest',
      environment: this.configService.get<string>('NODE_ENV', 'development')
    };
  }
}
