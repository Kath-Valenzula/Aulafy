# Modelo de datos

## Entidades principales

- `User`: representa administradores, colegio, profesores, apoderados y estudiantes. Tiene un rol principal.
- `Course`: curso academico con estudiantes y profesores asociados.
- `Subject`: asignatura asociada a un curso.
- `StudentProfile`: datos academicos complementarios del estudiante.
- `GuardianStudent`: vinculo entre apoderado y estudiante.
- `Post`: publicacion del curso o institucional.
- `Comment`: comentario asociado a una publicacion.
- `CalendarEvent`: evento del calendario academico.
- `Evaluation`: evaluacion de una asignatura.
- `Grade`: nota de un estudiante para una evaluacion.
- `Attendance`: registro diario de asistencia.
- `NotificationLog`: historial de intentos de notificacion.

## Relaciones

- Un curso tiene muchos estudiantes y muchos profesores mediante tablas intermedias.
- Una asignatura pertenece a un curso.
- Un estudiante puede tener un perfil academico y uno o mas apoderados vinculados.
- Una publicacion pertenece a un curso y tiene un autor.
- Un comentario pertenece a una publicacion y tiene un autor.
- Un evento pertenece a un curso y registra quien lo creo.
- Una evaluacion pertenece a curso y asignatura.
- Una nota vincula estudiante y evaluacion.
- Una asistencia vincula estudiante, curso y fecha.

## Decisiones de diseno

- El rol se guarda como enum en `users.role` para simplificar el MVP.
- Las publicaciones y comentarios usan borrado logico con `active`.
- Las notas se guardan como decimal para respetar escala academica chilena.
- El porcentaje de asistencia considera `PRESENTE` y `ATRASADO` como asistencia efectiva.
- Telegram no guarda credenciales en base de datos; solo logs de envio.

## Extension futura

- Agregar tabla `roles` y `user_roles` si el colegio necesita multiples roles por usuario.
- Agregar periodos academicos y ponderaciones por semestre.
- Agregar configuracion por establecimiento para parametros de asistencia, escala y notificaciones.
