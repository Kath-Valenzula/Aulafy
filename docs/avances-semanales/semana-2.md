# Semana 2

## Configurado

- Repositorio con estructura profesional para backend, frontend, docs, database y Docker.
- Backend Spring Boot con arquitectura modular por dominio.
- PostgreSQL preparado con Docker Compose.
- Seguridad JWT con roles principales.
- Frontend Angular con login, layout protegido, sidebar y pantallas iniciales.
- Resource Group Azure staging creado sin recursos pagados adicionales.
- Scripts `infra/azure` preparados para creacion controlada.

## Modulos iniciados

- Usuarios y roles.
- Cursos.
- Publicaciones y comentarios.
- Calendario academico.
- Notas y resumen academico.
- Asistencia y resumen.
- Notificaciones Telegram sin credenciales en el repositorio.
- Asignaturas y evaluaciones.
- Validaciones backend por rol, curso y vinculo apoderado-estudiante.

## Evidencias esperadas

- `mvn clean test` con 10 pruebas verdes.
- `npm run build` exitoso.
- Login funcional con usuarios demo.
- Visualizacion del muro, calendario, notas y asistencia.
- Registro de intento Telegram en modo no configurado.

## Proximos pasos

1. Crear PR hacia `develop`.
2. Configurar GitHub Secrets cuando staging sea autorizado.
3. Crear recursos pagados solo para validacion cloud.
4. Preparar capturas de evidencia.
5. Pulir formularios mobile-first para demo final.
