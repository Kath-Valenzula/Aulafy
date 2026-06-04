# Aulafy API NestJS

Backend en NestJS para la migracion de stack de Aulafy.

## Ejecutar en local

1. Copiar variables:

```bash
cp .env.example .env
```

2. Instalar dependencias:

```bash
npm install
```

3. Levantar en modo desarrollo:

```bash
npm run start:dev
```

La API queda en `http://localhost:8080/api`.

## Estado actual

- Estructura modular base creada: `auth`, `users`, `chat`, `calendar`, `annotations`, `health`.
- Conexion MySQL configurada con `@nestjs/typeorm`.
- Endpoints migrados en funcionamiento:
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - `GET /api/users`
  - `GET /api/users/:id`
  - `POST /api/users`
  - `PUT /api/users/:id`
  - `PATCH /api/users/:id/status`
- Modulos `chat`, `calendar` y `annotations` siguen en version inicial.
