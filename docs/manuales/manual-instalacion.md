# Manual de instalacion

## Requisitos

- Java 17.
- Maven.
- Node.js compatible con Angular.
- Docker Desktop para PostgreSQL local.
- Git.

## Base de datos local

```bash
docker compose up -d
```

## Backend

```bash
cd backend/aulafy-api
mvn clean test
mvn spring-boot:run
```

API local:

```text
http://localhost:8080/api
```

Health:

```text
http://localhost:8080/api/health
```

## Frontend

```bash
cd frontend/aulafy-web
npm install
npm start
```

Frontend local:

```text
http://localhost:4200
```

## Staging Azure

Revisar `docs/despliegue/azure-staging.md` e `infra/azure/README.md`. No crear recursos pagados sin autorizacion.
