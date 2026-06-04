# Matriz de requerimientos

| ID | Requerimiento | Prioridad | Estado | Evidencia |
| --- | --- | --- | --- | --- |
| RF-01 | Login con JWT | Alta | Implementado base Nest | `backend/aulafy-api-nest/src/auth` |
| RF-02 | Control de acceso por roles | Alta | Implementado base Nest | `backend/aulafy-api-nest/src/common/auth` |
| RF-03 | Administracion de usuarios | Alta | Implementado base Nest | `backend/aulafy-api-nest/src/users` |
| RF-04 | Administracion de cursos | Alta | Pendiente migracion | `docs/arquitectura/migracion-stack-nestjs-mysql-aws.md` |
| RF-05 | Publicaciones por curso | Alta | Pendiente migracion | `docs/arquitectura/migracion-stack-nestjs-mysql-aws.md` |
| RF-06 | Comentarios controlados | Media | Pendiente migracion | `docs/arquitectura/migracion-stack-nestjs-mysql-aws.md` |
| RF-07 | Calendario academico | Alta | En migracion | `backend/aulafy-api-nest/src/calendar` |
| RF-08 | Asignaturas | Alta | Pendiente migracion | `docs/arquitectura/migracion-stack-nestjs-mysql-aws.md` |
| RF-09 | Evaluaciones | Alta | Pendiente migracion | `docs/arquitectura/migracion-stack-nestjs-mysql-aws.md` |
| RF-10 | Notas y resumen academico | Alta | Pendiente migracion | `docs/arquitectura/migracion-stack-nestjs-mysql-aws.md` |
| RF-11 | Asistencia y resumen | Alta | Pendiente migracion | `docs/arquitectura/migracion-stack-nestjs-mysql-aws.md` |
| RF-12 | Notificaciones Telegram | Media | Pendiente migracion | `docs/arquitectura/migracion-stack-nestjs-mysql-aws.md` |
| RF-13 | Chat interno integrado con Telegram | Alta | En migracion | `backend/aulafy-api-nest/src/chat` |
| RF-14 | Anotaciones/comunicaciones por estudiante | Alta | En migracion | `backend/aulafy-api-nest/src/annotations` |
| RNF-01 | No guardar secretos en repositorio | Alta | Implementado | `.env.example` |
| RNF-02 | Arquitectura monolitica modular | Alta | Implementado | `backend/aulafy-api-nest/src` |
| RNF-03 | Mobile-first (app familias/alumnos) | Media | En progreso | `frontend/aulafy-web` |
| RNF-04 | Backoffice escritorio profesor/admin | Alta | Planificado | `docs/arquitectura/arquitectura.md` |
| RNF-05 | Staging en AWS con CI/CD GitHub | Alta | En migracion | `docs/arquitectura/migracion-stack-nestjs-mysql-aws.md` |
