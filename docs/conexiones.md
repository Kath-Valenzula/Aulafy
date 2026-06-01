# Conexiones y Credenciales — Aulafy

> IMPORTANTE: Este archivo documenta la ESTRUCTURA de credenciales, no secretos reales.
> Los valores sensibles deben vivir en archivos `.env` locales o en secretos del proveedor CI/CD.

---

## 1) Variables de Entorno Backend (fuente principal)

Archivo base de referencia:

- `backend/aulafy-api-nest/.env.example`

Estructura actual:

```bash
NODE_ENV=development
PORT=8080

DB_HOST=localhost
DB_PORT=3306
DB_NAME=aulafy_db
DB_USER=aulafy_user
DB_PASSWORD=aulafy_pass

JWT_SECRET=<secreto_jwt>
TELEGRAM_BOT_TOKEN=<token_bot_telegram_opcional>
```

Notas:

- `DB_*` define conexion MySQL usada por TypeORM.
- `JWT_SECRET` firma y valida tokens de autenticacion.
- `TELEGRAM_BOT_TOKEN` habilita envio real a Telegram; si no existe, el sistema opera en modo degradado y registra `NOT_CONFIGURED`.

---

## 2) Variables de Entorno de Raiz (documentacion operativa)

Archivo:

- `.env.example`

Incluye la misma base del backend y adicionalmente:

```bash
FRONTEND_URL=http://localhost:4200
```

Uso esperado:

- Referencia para instalacion local y coordinacion backend/frontend.
- No guardar secretos reales en el repositorio.

---

## 3) Credenciales de Base de Datos Local (Docker)

Fuente:

- `docker-compose.yml`

Estructura actual:

```bash
MYSQL_DATABASE=aulafy_db
MYSQL_USER=aulafy_user
MYSQL_PASSWORD=<password_app>
MYSQL_ROOT_PASSWORD=<password_root_local>
```

Conexion local por defecto:

- Host: `localhost`
- Puerto: `3306`

---

## 4) URLs y Conexiones de Frontend

Archivos:

- `frontend/aulafy-web/src/environments/environment.ts`
- `frontend/aulafy-web/src/environments/environment.staging.ts`

Estructura:

```ts
export const environment = {
  apiUrl: '<url_backend>/api'
}
```

Estado actual detectado:

- Desarrollo: `http://localhost:8080/api`
- Staging: `https://api-staging.aulafy.cl/api`
- Produccion: `https://api.aulafy.cl/api`

Nota:

- Estas URLs se alinean al objetivo de despliegue en AWS y deben apuntar al API Gateway / Load Balancer definitivo del entorno.

---

## 5) Credenciales Funcionales de Aplicacion (demo)

Fuente:

- `README.md`

Formato de acceso:

- `email + password` en `/api/auth/login`
- respuesta JWT para `Authorization: Bearer <token>`

Cuentas demo documentadas:

- `admin@aulafy.cl`
- `colegio@aulafy.cl`
- `profesor@aulafy.cl`
- `apoderado@aulafy.cl`
- `estudiante@aulafy.cl`

Nota:

- Mantener estas cuentas solo para ambientes de prueba/controlados.

---

## 6) Credenciales/Secretos de CI-CD e Infra (pendiente de consolidar)

Estructura esperada (no encontrada completa en repo):

- variables GitHub Actions para despliegue AWS por OIDC:
  - `AWS_REGION`
  - `AWS_ROLE_TO_ASSUME`
  - `AWS_ECR_REPOSITORY`
  - `AWS_ECS_CLUSTER`
  - `AWS_ECS_SERVICE`
  - `AWS_ECS_TASK_DEFINITION_FAMILY`
  - `AWS_ECS_CONTAINER_NAME`
  - `AWS_S3_BUCKET_STAGING`
  - `AWS_CLOUDFRONT_DISTRIBUTION_ID` (opcional)
- variables por entorno para backend y frontend (staging/produccion).
- token/credenciales de servicios externos adicionales (si se incorporan).

---

## 7) Reglas de Seguridad Operativa

- Nunca commitear `.env` con valores reales.
- Rotar `JWT_SECRET` y credenciales DB al pasar a produccion.
- Registrar y auditar cambios de secretos en `docs/changelog.md`.
- Mantener principio de minimo privilegio en credenciales de AWS/GitHub.

---

> Actualizar este archivo cuando cambien variables, endpoints, entornos o proveedores.
