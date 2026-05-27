# Matriz de requerimientos

| ID | Requerimiento | Prioridad | Estado | Evidencia |
| --- | --- | --- | --- | --- |
| RF-01 | Login con JWT | Alta | Implementado | `/api/auth/login` |
| RF-02 | Control de acceso por roles | Alta | Implementado base | `SecurityConfig`, `AccessControlService` |
| RF-03 | Administracion de usuarios | Alta | Implementado base | `/api/users` |
| RF-04 | Administracion de cursos | Alta | Implementado base | `/api/courses` |
| RF-05 | Publicaciones por curso | Alta | Implementado | `/api/courses/{id}/posts` |
| RF-06 | Comentarios controlados | Media | Implementado base | `/api/posts/{id}/comments` |
| RF-07 | Calendario academico | Alta | Implementado base | `/api/courses/{id}/events` |
| RF-08 | Asignaturas | Alta | Implementado base | `/api/subjects` |
| RF-09 | Evaluaciones | Alta | Implementado base | `/api/evaluations` |
| RF-10 | Notas y resumen academico | Alta | Implementado | `/api/students/{id}/academic-summary` |
| RF-11 | Asistencia y resumen | Alta | Implementado | `/api/students/{id}/attendance-summary` |
| RF-12 | Notificaciones Telegram | Media | Preparado | `/api/notifications/telegram/test` |
| RNF-01 | No guardar secretos en repositorio | Alta | Implementado | `.env.example`, App Settings |
| RNF-02 | Arquitectura monolitica modular | Alta | Implementado | `backend/aulafy-api` |
| RNF-03 | Mobile-first | Media | En progreso | Angular + SCSS |
| RNF-04 | Staging cloud controlado | Alta | Preparado | `docs/despliegue`, `infra/azure` |
