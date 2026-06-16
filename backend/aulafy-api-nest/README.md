# Aulafy API NestJS

Backend oficial de Aulafy construido con NestJS, TypeScript, TypeORM y MySQL.

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

- Backend modular con `auth`, `users`, `courses`, `academic-structure`, `academic`, `attendance`, `calendar`, `feed`, `annotations`, `notifications`, `risk`, `chat` y `health`.
- Conexion MySQL configurada con TypeORM.
- Endpoints disponibles:
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - `GET /api/users`
  - `GET /api/users/:id`
  - `POST /api/users`
  - `PUT /api/users/:id`
  - `PATCH /api/users/:id/status`
  - `GET /api/courses`
  - `GET /api/academic`
  - `GET /api/attendance`
  - `GET /api/annotations`
  - `GET /api/notifications/logs`
  - `GET /api/risk/academic`
- Modulo `chat` presente como funcionalidad experimental/post-MVP.
