# Avance semanal

## Semana actual

Se fortalecio la base del MVP con foco en seguridad, gestion academica y preparacion de staging controlado por costos.

## Actividades realizadas

- Validacion local de backend y frontend.
- Preparacion de scripts Azure sin creacion automatica de recursos pagados.
- Refuerzo de permisos por rol y pertenencia.
- Mejora de asignaturas, evaluaciones, notas y resumen academico.
- Actualizacion de modelo de datos y documentacion.
- Ampliacion de pruebas backend.

## Evidencias esperadas

- `mvn clean test` exitoso.
- `mvn clean package` exitoso.
- `npm run build` exitoso.
- `npm run build:staging` exitoso.
- Git status limpio despues del commit.
- Documentacion actualizada en `docs`.

## Proximos pasos

- Crear PR hacia `develop`.
- Configurar secretos en GitHub cuando se autorice staging.
- Crear recursos pagados solo el dia de validacion cloud.
- Ejecutar workflows manualmente cuando existan recursos reales.
