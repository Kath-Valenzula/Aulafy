# Checklist staging

## Antes de crear recursos

- [x] Backend compila.
- [x] Frontend compila.
- [ ] Tests pasan.
- [ ] README actualizado.
- [ ] No hay secretos en el repositorio.
- [x] Estrategia AWS definida (ECS Fargate + S3/CloudFront).
- [ ] Costo estimado de RDS + compute autorizado por el equipo.

## AWS

- [ ] Cuenta y permisos del proyecto confirmados.
- [ ] Repositorio ECR creado.
- [ ] Cluster/servicio backend creado.
- [ ] RDS MySQL staging creado.
- [ ] Bucket S3 + CloudFront frontend creado.
- [ ] Variables y secretos configurados en entorno.
- [x] GitHub OIDC configurado para despliegue seguro (workflows preparados para `AWS_ROLE_TO_ASSUME`).
- [ ] Workflows ejecutados y con evidencia.

## Validacion

- [ ] `/api/health` responde.
- [ ] Frontend abre.
- [ ] Login funciona.
- [ ] Dashboard funciona.
- [ ] Publicaciones funcionan.
- [ ] Calendario funciona.
- [ ] Notas/asistencia funcionan.
- [ ] Telegram probado o documentado como pendiente.

## Pipeline del repositorio

- [x] CI backend NestJS (`backend-nest-ci.yml`).
- [x] CI frontend Angular (`frontend-angular-ci.yml`).
- [x] Deploy backend AWS ECS (`backend-aws-ecs-deploy.yml`).
- [x] Deploy frontend AWS S3/CloudFront (`frontend-aws-s3-deploy.yml`).

## Costos

- [ ] Presupuesto y alertas de costo configuradas.
- [ ] Recursos no usados eliminados al cerrar validaciones.
- [ ] Repositorio ECR y snapshots de RDS revisados para evitar costos pasivos.
