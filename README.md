# Aulafy

Aulafy es una plataforma web de comunicacion y gestion escolar para centralizar publicaciones, calendario academico, notas, asistencia, anotaciones y chat interno integrado con Telegram.

El proyecto migra su stack a arquitectura cliente-servidor con:

- Backend NestJS.
- Frontend Angular.
- Base de datos MySQL.
- Infraestructura AWS con CI/CD en GitHub Actions.

## Integrantes

- Katherine Gisselle Valenzuela Moreno
- Sebastian Alberto Briceno Inostroza

Profesor: Alonso Esteban Castillo Pizarro

## Stack tecnico

- Backend: NestJS, TypeScript, JWT, TypeORM, class-validator.
- Frontend: Angular 21, TypeScript, SCSS, Angular Router, Reactive Forms, HttpClient.
- Base de datos: MySQL 8 mediante Docker Compose.
- Pruebas: en migracion a stack Node/Nest.
- Integraciones: Telegram Bot API.

## Arquitectura

El proyecto usa un monolito modular separado en cliente web y API REST:

- `frontend/aulafy-web`: aplicacion Angular mobile-first.
- `backend/aulafy-api-nest`: API NestJS con modulos por dominio.
- `backend/aulafy-api`: backend legado Spring Boot (referencia temporal de migracion).
- `database`: scripts SQL en transicion a MySQL.
- `docs`: documentacion tecnica, casos de uso y plan de pruebas.

No se usan microservicios porque el MVP requiere simplicidad operativa, menor costo y trazabilidad clara para entrega academica.

## Modulos principales

- Auth y seguridad JWT.
- Gestion de usuarios y roles.
- Cursos, asignaturas y evaluaciones.
- Feed academico tipo red social.
- Calendario por curso.
- Anotaciones/comunicaciones personales del estudiante.
- Chat interno integrado con Telegram.
- Asistencia y resumen academico.

## Roles

- `ADMIN`
- `COLEGIO`
- `PROFESOR`
- `APODERADO`
- `ESTUDIANTE`

Para el MVP cada usuario tiene un rol principal. La estructura queda preparada para extender permisos si luego se requiere un modelo de multiples roles.

## Ejecucion

Base de datos:

```bash
docker compose up -d
```

Backend NestJS:

```bash
cd backend/aulafy-api-nest
cp .env.example .env
npm install
npm run build
npm run start:dev
```

Frontend:

```bash
cd frontend/aulafy-web
npm install
npm start
```

La interfaz queda disponible en `http://localhost:4200` y la API en `http://localhost:8080/api`.

## Variables de entorno

```bash
NODE_ENV=development
PORT=8080

DB_HOST=localhost
DB_PORT=3306
DB_NAME=aulafy_db
DB_USER=aulafy_user
DB_PASSWORD=aulafy_pass

JWT_SECRET=definir-una-clave-larga-para-produccion
TELEGRAM_BOT_TOKEN=
```

## Documentacion de migracion

- `docs/arquitectura/arquitectura.md`
- `docs/arquitectura/migracion-stack-nestjs-mysql-aws.md`
- `docs/manuales/manual-instalacion.md`

## Credenciales demo

- `admin@aulafy.cl` / `Admin1234`
- `colegio@aulafy.cl` / `Colegio1234`
- `profesor@aulafy.cl` / `Profesor1234`
- `apoderado@aulafy.cl` / `Apoderado1234`
- `estudiante@aulafy.cl` / `Estudiante1234`

## Estado actual del MVP

- Backend NestJS base creado con modulos iniciales (`auth`, `users`, `chat`, `calendar`, `annotations`, `health`).
- Frontend Angular operativo y en proceso de adaptacion por fases.
- Documentacion oficial actualizada al nuevo stack objetivo.
- Backend Spring Boot queda como referencia temporal durante la migracion.

## Roadmap

1. Completar paridad funcional Auth/Users/Courses en NestJS.
2. Migrar modulos academicos (feed, calendario, anotaciones, asistencia, notas).
3. Implementar chat interno con integracion Telegram.
4. Consolidar pipelines GitHub Actions para AWS.
5. Retirar backend legado Spring al cumplir paridad y pruebas.
