# Plan de calidad

## Criterios

- Backend compila con Maven.
- Frontend compila con Angular.
- Tests backend pasan antes de PR.
- No existen secretos reales versionados.
- Controladores delegan reglas de negocio a servicios.
- DTOs separan API de entidades.
- Errores usan mensajes claros.
- Documentacion se mantiene alineada al codigo.

## Validaciones

```bash
cd backend/aulafy-api
mvn clean test
mvn clean package

cd ../../frontend/aulafy-web
npm install
npm run build
npm run build:staging
```

## Revision

Antes de una entrega se revisa:

- Seguridad por rol.
- Datos demo.
- Flujo login.
- Feed.
- Calendario.
- Notas.
- Asistencia.
- Telegram sin secretos.
- Documentacion de despliegue.
