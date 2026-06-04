# Changelog de Sesiones — Aulafy

> El agente actualiza este archivo al final de cada sesión con cambios.
> Orden: más reciente arriba.

---

## [2026-05-31] Documento HTML consolidado de plan y avance

**Sesion**: Generacion de reporte completo en formato HTML para presentacion y seguimiento.

**Archivo creado**:
- `docs/plan-avance-completo.html`

**Contenido principal**:
- Objetivo y alcance del sistema.
- Roadmap por fases con estado consolidado.
- Avance backend/frontend por modulo.
- Endpoints clave implementados.
- Estado de base de datos y migraciones.
- Estado de CI/CD e infraestructura AWS.
- ADRs relevantes, credenciales por estructura, riesgos y plan siguiente.

---

## [2026-05-30] Cierre tecnico Fase 4 y Fase 5 (comunicaciones + infra AWS)

**Sesion**: Implementacion para cerrar fases de roadmap con chat funcional y pipelines AWS.

**Comunicaciones (Fase 4)**:
- Backend chat migrado a flujo real con salas/mensajes:
  - `GET /api/chat/rooms`
  - `POST /api/chat/rooms`
  - `GET /api/chat/rooms/:roomId/messages`
  - `POST /api/chat/rooms/:roomId/messages`
- Nuevas entidades: `chat_rooms` y `chat_messages`.
- Control de acceso por rol/pertenencia academica en chat.
- Notificacion Telegram automatica al enviar mensaje de chat (con trazabilidad por destinatario).
- Frontend integrado:
  - `features/messages` ahora lista salas reales.
  - `features/chat` ahora consume mensajes reales y permite enviar.
  - Nuevo `core/services/chat.service.ts`.

**Infra AWS (Fase 5)**:
- Nuevo CI frontend: `.github/workflows/frontend-angular-ci.yml`.
- Nuevo deploy backend AWS ECS: `.github/workflows/backend-aws-ecs-deploy.yml`.
- Nuevo deploy frontend AWS S3/CloudFront: `.github/workflows/frontend-aws-s3-deploy.yml`.
- Eliminados workflows legacy Azure.
- Agregado `backend/aulafy-api-nest/Dockerfile` y `.dockerignore`.
- Actualizadas URLs frontend staging/prod a dominios objetivo AWS.

**Base de datos**:
- `schema.sql` y `seed.sql` actualizados para chat.
- Nueva migracion: `database/mysql/migrations/20260531_chat_bridge.sql`.

**Documentacion actualizada**:
- `docs/arquitectura/arquitectura.md`
- `docs/estado-actual.md`
- `docs/despliegue/aws-staging.md`
- `docs/despliegue/checklist-staging.md`
- `docs/gestion/backlog.md`
- `docs/arquitectura/migracion-stack-nestjs-mysql-aws.md`
- `docs/conexiones.md`

**Verificacion**:
- `npm run build` backend ✅
- `npm run build` frontend ✅

**Pendiente**:
- [ ] Ejecutar despliegue staging real en AWS y registrar evidencia.
- [ ] Incorporar pruebas automatizadas para chat y notificaciones.

---

## [2026-05-30] Documentacion operativa completada tras bootstrap Cursor

**Sesion**: Complecion de documentos base creados por bootstrap para continuidad de trabajo en Cursor.

**Cambios**:
- `docs/estado-actual.md` actualizado con estado real del proyecto (stack, modulos operativos, riesgos y backlog prioritario).
- `docs/conexiones.md` actualizado con estructura real de credenciales y conexiones (backend env, docker mysql, frontend environments, demo users).
- `docs/decisiones.md` inicializado con ADRs vigentes y rationale tecnico.

**Resultado**:
- Base documental de sesion lista para trabajo incremental sin perder contexto tecnico.

**Pendiente**:
- [ ] Mantener estos documentos al dia al cierre de cada bloque funcional.

---

## [2026-05-30] Notificaciones automaticas por dominios academicos

**Sesion**: Extension del modulo de notificaciones para cubrir flujos automaticos.

**Backend**:
- Export de `NotificationsService` para reutilizacion transversal.
- En `calendar`: envio automatico al crear evento con `notifyTelegram=true` a participantes del curso con `telegram_chat_id`.
- En `annotations`: envio automatico al crear anotacion para alumno/apoderado vinculados con `telegram_chat_id`.
- Mantencion de modo degradado (`NOT_CONFIGURED`) con trazabilidad en `notification_logs`.

**Documentacion**:
- `docs/arquitectura/arquitectura.md` actualizado con el comportamiento automatico de notificaciones.

**Verificacion**:
- Build backend ejecutado en verde.

**Pendiente**:
- [ ] Completar chat Telegram end-to-end.
- [ ] Incorporar pruebas automatizadas para notificaciones.

---

## [2026-05-30] Bootstrap de estructura Cursor y grafo de codigo

**Sesion**: Ejecucion de bootstrap para estandarizar operacion con agente.

**Comando ejecutado**:
- `~/scripts/bootstrap-cursor.sh "NestJS + Angular + MySQL + AWS (GitHub Actions CI/CD)"`

**Archivos generados**:
- `.cursor/rules/sesion-agente.mdc`
- `.cursor/rules/analisis-codigo.mdc`
- `.cursor/rules/graphify.mdc`
- `docs/estado-actual.md`
- `docs/changelog.md`
- `docs/conexiones.md`
- `docs/decisiones.md`
- `graphify-out/*`

**Pendiente**:
- [x] Completar `docs/estado-actual.md` con estado real.
- [x] Completar `docs/conexiones.md` con estructura de credenciales.

---

## [2026-05-30] Setup inicial de estructura Cursor

**Sesión**: Inicialización del proyecto con estructura estándar de Cursor.

**Archivos creados**:
- `docs/estado-actual.md` — estado del proyecto y pendientes
- `docs/changelog.md` — este archivo
- `docs/conexiones.md` — credenciales y endpoints
- `docs/decisiones.md` — registro de decisiones técnicas
- `.cursor/rules/sesion-agente.mdc` — protocolo del agente
- `.cursor/rules/analisis-codigo.mdc` — protocolo de análisis

**Pendiente**:
- [ ] Completar docs/estado-actual.md con el estado real del proyecto
- [ ] Completar docs/conexiones.md con las credenciales del proyecto

---

<!-- Agente: nuevas entradas ARRIBA de esta línea -->
