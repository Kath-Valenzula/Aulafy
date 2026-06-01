import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync
} from 'class-validator';
import { plainToInstance } from 'class-transformer';

class EnvSchema {
  @IsOptional()
  @IsEnum(['development', 'test', 'production'])
  NODE_ENV?: 'development' | 'test' | 'production';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT?: number;

  @IsString()
  @IsNotEmpty()
  DB_HOST!: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  DB_PORT!: number;

  @IsString()
  @IsNotEmpty()
  DB_NAME!: string;

  @IsString()
  @IsNotEmpty()
  DB_USER!: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsOptional()
  @IsString()
  TELEGRAM_BOT_TOKEN?: string;
}

export function validateEnv(config: Record<string, unknown>): EnvSchema {
  const validatedConfig = plainToInstance(EnvSchema, config, {
    enableImplicitConversion: true
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false
  });

  if (errors.length > 0) {
    const details = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join(' | ');
    throw new Error(`Configuracion de entorno invalida: ${details}`);
  }

  return validatedConfig;
}
