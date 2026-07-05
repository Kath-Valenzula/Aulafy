import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    })
  );

  const allowedOrigins = getAllowedOrigins();
  app.enableCors({
    origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.has(normalizeOrigin(origin))) {
        callback(null, true);
        return;
      }

      callback(new Error('Origen no permitido por CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Aulafy API')
    .setDescription('API REST del sistema académico Aulafy')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT ?? 8080);
  await app.listen(port);
}

void bootstrap();

function getAllowedOrigins(): Set<string> {
  const fixedOrigins = [
    'http://localhost:4200',
    'http://127.0.0.1:4200',
    'http://aulafy-frontend-803615173905.s3-website.us-east-2.amazonaws.com'
  ];
  const configuredOrigins = (process.env.FRONTEND_URL ?? '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);

  return new Set([...fixedOrigins, ...configuredOrigins]);
}

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, '');
}
