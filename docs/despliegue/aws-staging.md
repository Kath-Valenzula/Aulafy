# Despliegue Staging en AWS (objetivo)

## Objetivo

Definir la base de despliegue para el stack Angular + NestJS + MySQL usando GitHub Actions y servicios AWS.

## Topologia propuesta

- Frontend Angular: S3 + CloudFront.
- Backend NestJS: ECS Fargate o Elastic Beanstalk (decision final pendiente).
- Base de datos: Amazon RDS MySQL.
- Secretos: AWS Secrets Manager.
- Observabilidad: CloudWatch Logs y metricas basicas.

## Variables y secretos esperados

- `AWS_REGION`
- `AWS_ROLE_TO_ASSUME` (OIDC para GitHub Actions)
- `AWS_ECR_REPOSITORY`
- `AWS_ECS_CLUSTER` / `AWS_ECS_SERVICE` (si se usa ECS)
- `DATABASE_URL` o variables separadas (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`)
- `JWT_SECRET`
- `TELEGRAM_BOT_TOKEN`

## Estado actual

- CI backend habilitado en `.github/workflows/backend-nest-ci.yml`.
- CI frontend habilitado en `.github/workflows/frontend-angular-ci.yml`.
- Deploy backend AWS ECS implementado en `.github/workflows/backend-aws-ecs-deploy.yml`.
- Deploy frontend AWS S3/CloudFront implementado en `.github/workflows/frontend-aws-s3-deploy.yml`.

## Variables de GitHub Actions requeridas

Definir en `Repository variables`:

- `AWS_REGION`
- `AWS_ROLE_TO_ASSUME`
- `AWS_ECR_REPOSITORY`
- `AWS_ECS_CLUSTER`
- `AWS_ECS_SERVICE`
- `AWS_ECS_TASK_DEFINITION_FAMILY`
- `AWS_ECS_CONTAINER_NAME`
- `AWS_S3_BUCKET_STAGING`
- `AWS_CLOUDFRONT_DISTRIBUTION_ID` (opcional, si se invalida cache)

## Flujo de despliegue recomendado

1. Verificar CI backend/frontend en verde.
2. Ejecutar workflow `Backend AWS ECS Deploy` (push a `develop` o manual).
3. Ejecutar workflow `Frontend AWS S3 Deploy`.
4. Validar health y rutas criticas.

## Notas operativas

- El backend NestJS se publica como imagen Docker desde `backend/aulafy-api-nest/Dockerfile`.
- El deploy ECS reutiliza el task definition existente en AWS y actualiza la imagen del contenedor objetivo.
- La publicacion frontend sincroniza `dist/aulafy-web/browser` al bucket S3 configurado.
