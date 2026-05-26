# Semana 2

## Configurado

- Repositorio con estructura profesional para backend, frontend, docs, database y Docker.
- Backend Spring Boot con arquitectura modular por dominio.
- PostgreSQL preparado con Docker Compose.
- Seguridad JWT con roles principales.
- Frontend Angular con login, layout protegido, sidebar y pantallas iniciales.

## Modulos iniciados

- Usuarios y roles.
- Cursos.
- Publicaciones y comentarios.
- Calendario academico.
- Notas y resumen academico.
- Asistencia y resumen.
- Notificaciones Telegram sin credenciales en el repositorio.

## Evidencias esperadas

- `mvn clean test` con pruebas verdes.
- `npm run build` exitoso.
- Login funcional con usuarios demo.
- Visualizacion del muro, calendario, notas y asistencia.
- Registro de intento Telegram en modo no configurado.

## Proximos pasos

1. Restringir datos por pertenencia real a curso.
2. Crear mantenedor de asignaturas y evaluaciones.
3. Agregar validaciones visuales por campo en Angular.
4. Agregar pruebas de controladores con seguridad.
5. Preparar presentacion tecnica con capturas del flujo demo.
