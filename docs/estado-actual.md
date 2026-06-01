# Estado Actual — Aulafy

> Ultima actualizacion: 2026-05-30
> Actualizar al final de cada sesion relevante con el agente.

---

## Stack Tecnologico

- Backend: NestJS + TypeScript + TypeORM + JWT.
- Frontend: Angular 21 + TypeScript.
- Base de datos: MySQL 8 (Docker Compose para entorno local).
- Integracion: Telegram Bot API (modo degradado soportado).
- CI/CD: flujos activos backend/frontend + despliegue AWS (ECS y S3/CloudFront) listos para ejecutar con variables de entorno.

---

## Estado General

- Monolito modular funcionando en `backend/aulafy-api-nest` y cliente Angular en `frontend/aulafy-web`.
- Build backend (`npm run build`) y build frontend (`npm run build`) exitosos en la sesion actual.
- Modelo academico base migrado desde `childsafe` (`levels`, `cycles`, `cycle_levels`, `students`) con scripts MySQL.
- Backend Spring legacy (`backend/aulafy-api`) se mantiene como referencia temporal de migracion.

### Modulos Backend (NestJS)

- `health`: operativo.
- `auth` y `users`: operativo (login JWT, perfil y gestion de usuarios por rol).
- `academic-structure`: operativo (niveles, ciclos y alumnos).
- `courses`: operativo (cursos, asignaturas y vinculos).
- `academic`: operativo (evaluaciones, notas y resumen academico).
- `attendance`: operativo (registro y resumen de asistencia).
- `calendar`: operativo (CRUD base por curso).
- `annotations`: operativo (anotaciones por alumno/curso).
- `feed`: operativo (posts y comentarios por curso).
- `notifications`: operativo (test/envio Telegram + bitacora `notification_logs`).
- `chat`: operativo (salas de curso, mensajes, control de acceso academico y notificacion Telegram automatica por mensaje).

### Frontend Angular (Rutas/Features)

- Operativas y conectadas a API real: `courses`, `academic`, `attendance`, `calendar`, `annotations`, `feed`, `notifications`, `messages`, `chat`.
- Disponibles por rol en UX Stitch: `dashboard`, `guardian`, `messages`, `profile`, `risk`, `users`, `chat-profesor`.
- Login + guardias de autenticacion/autorizacion activos.

### Estado de Notificaciones Telegram

- Envio manual habilitado en `POST /api/notifications/telegram/test` y `POST /api/notifications/telegram/send`.
- Modo degradado activo cuando falta `TELEGRAM_BOT_TOKEN` (registra `NOT_CONFIGURED` en `notification_logs`).
- Envio automatico implementado al:
  - crear evento de calendario con `notifyTelegram=true`,
  - crear anotacion de alumno (a alumno/apoderado con `telegram_chat_id`),
  - enviar mensajes en chat de curso (a participantes con `telegram_chat_id`).

---

## Features Activos (resumen)

- [x] Autenticacion JWT y control por roles.
- [x] Gestion academica base (estructura, cursos, asignaturas, notas, asistencia).
- [x] Calendario por curso con creacion de eventos.
- [x] Anotaciones por estudiante.
- [x] Feed por curso con comentarios.
- [x] Notificaciones Telegram con trazabilidad en bitacora.
- [x] Frontend Stitch conectado a backend real en modulos principales.

---

## Bugs Conocidos / Riesgos Tecnicos

- No existe suite de pruebas automatizadas funcional (scripts de test en migracion en backend).
- Despliegue AWS depende de configuracion de variables OIDC/ECR/ECS/S3/CloudFront en la cuenta del proyecto.

---

## Pendientes / Backlog (alta prioridad)

- [ ] Completar cobertura de pruebas (unitarias e integracion) en backend y frontend.
- [ ] Ejecutar primer despliegue AWS con evidencia y validar endpoints en entorno staging.
- [ ] Homologar dominios/URLs finales de staging/produccion y cerrar dependencias legacy.

---

## Proxima Sesion Recomendada

1. Revisar `docs/changelog.md` y este archivo.
2. Ejecutar deploy AWS staging y validar checklist funcional de extremo a extremo.
3. Definir plan de pruebas automatizadas minimas por modulo critico.
