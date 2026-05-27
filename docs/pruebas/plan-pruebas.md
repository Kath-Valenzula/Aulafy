# Plan de pruebas

## Pruebas unitarias backend

Ejecutar:

```bash
cd backend/aulafy-api
mvn clean test
```

Casos actuales automatizados:

- `AuthServiceTest`: login valido retorna JWT y usuario.
- `AuthServiceTest`: login invalido propaga credenciales invalidas.
- `SecurityIntegrationTest`: endpoint protegido sin token responde 401.
- `SecurityIntegrationTest`: rol incorrecto recibe 403.
- `PostServiceTest`: crea publicacion valida para un curso.
- `CommentServiceTest`: bloquea comentario si la publicacion no permite comentarios.
- `CalendarEventServiceTest`: crea evento sin enviar Telegram cuando no corresponde.
- `AcademicSummaryServiceTest`: calcula promedio parcial.
- `AttendanceServiceTest`: calcula porcentaje de asistencia.
- `TelegramNotificationServiceTest`: Telegram sin variables no rompe la aplicacion.

## Pruebas manuales frontend

1. Levantar PostgreSQL con `docker compose up -d`.
2. Levantar backend con `mvn spring-boot:run`.
3. Levantar frontend con `npm start`.
4. Ingresar a `http://localhost:4200`.

## Login

- Iniciar sesion con `admin@aulafy.cl / Admin1234`.
- Iniciar sesion con `profesor@aulafy.cl / Profesor1234`.
- Probar credenciales invalidas y verificar mensaje de error.
- Cerrar sesion y confirmar redireccion a login.

## Permisos

- ADMIN/COLEGIO debe ver usuarios, cursos y Telegram.
- PROFESOR debe ver muro, calendario, notas, asistencia y Telegram.
- APODERADO/ESTUDIANTE no deben ver administracion de usuarios o cursos.
- ESTUDIANTE solo debe ver su informacion academica.
- APODERADO solo debe ver estudiantes vinculados.
- PROFESOR solo debe administrar cursos asignados.

## Publicaciones

- Crear una publicacion como profesor.
- Ver el muro del curso demo.
- Confirmar que se muestran tipo, autor y estado de comentarios.

## Calendario

- Crear evento como profesor.
- Crear evento con `notifyTelegram` sin variables configuradas y verificar log `NO_CONFIGURADO`.
- Confirmar orden por fecha.

## Notas

- Consultar estudiante demo con id `5`.
- Crear evaluacion en una asignatura activa.
- Registrar una nota usando evaluacion demo id `1`.
- Confirmar que el promedio se actualiza.
- Confirmar mensaje "Sin evaluaciones registradas" si el estudiante no tiene notas.
- Confirmar mensaje de promedio parcial cuando existe una sola evaluacion.

## Asistencia

- Consultar asistencia del estudiante demo id `5`.
- Registrar asistencia de hoy para curso id `1`.
- Confirmar porcentaje actualizado.

## Telegram

- Ejecutar prueba sin variables y confirmar que la app no falla.
- Configurar `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID`.
- Reiniciar backend y enviar mensaje de prueba.
