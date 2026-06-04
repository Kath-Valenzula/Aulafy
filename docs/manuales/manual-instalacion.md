# Manual de instalacion

## Requisitos

- Node.js 20 o superior.
- npm 10 o superior.
- Docker Desktop para MySQL local.
- Git.

## Base de datos local

```bash
docker compose up -d
```

## Backend NestJS (objetivo)

```bash
cd backend/aulafy-api-nest
cp .env.example .env
npm install
npm run build
npm run start:dev
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

## Backend legado (solo referencia temporal)

Mientras la migracion no termina, el backend legado sigue disponible en:

```bash
cd backend/aulafy-api
mvn clean test
mvn spring-boot:run
```

No se deben agregar nuevas funcionalidades en el backend legado, salvo fixes criticos.

## Staging AWS (objetivo)

La configuracion de despliegue para AWS se documenta en las siguientes iteraciones de infraestructura.
