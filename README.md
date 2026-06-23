# Aulafy

Aulafy es un MVP academico de plataforma web para comunicacion y gestion escolar. Centraliza publicaciones, calendario academico, notas, asistencia y anotaciones para mejorar la coordinacion entre colegio, profesores, estudiantes y apoderados.

El stack oficial vigente es:

- Frontend Angular 21 con TypeScript.
- Backend NestJS con Node.js y TypeScript.
- Base de datos MySQL 8.x.
- ORM TypeORM.
- Entorno local con Docker Compose.
- Pruebas con Jest como estandar definido para el stack Node.
- Control de versiones en GitHub y seguimiento mediante GitHub Issues.
- Telegram Bot API solo como integracion opcional para notificaciones externas.
- AWS como entorno de demostracion academica: frontend en Amazon S3, backend en Elastic Beanstalk y base de datos MySQL en Amazon RDS.

## Integrantes

- Katherine Gisselle Valenzuela Moreno
- Sebastian Alberto Briceno Inostroza

Profesor: Alonso Esteban Castillo Pizarro

## Stack tecnico

- Backend: NestJS, Node.js, TypeScript, JWT, TypeORM, class-validator.
- Frontend: Angular 21, TypeScript, SCSS, Angular Router, Reactive Forms, HttpClient.
- Base de datos: MySQL 8 mediante Docker Compose en local y Amazon RDS en AWS.
- Pruebas: Jest como herramienta objetivo del proyecto.
- Integraciones: Telegram Bot API para avisos externos opcionales.

## Arquitectura

El proyecto usa un monolito modular separado en cliente web y API REST:

- `frontend/aulafy-web`: aplicacion Angular mobile-first.
- `backend/aulafy-api-nest`: API NestJS con modulos por dominio.
- `database/mysql`: scripts oficiales de esquema y datos demo en MySQL.
- `docs`: documentacion academica final e imagenes de evidencia.
- `.github/workflows`: integracion continua y flujos manuales de despliegue AWS.

No se usan microservicios porque el MVP requiere simplicidad operativa, menor costo y trazabilidad clara para entrega academica.

## Modulos principales

- Auth y seguridad JWT.
- Gestion de usuarios y roles.
- Cursos, asignaturas y evaluaciones.
- Feed academico tipo red social.
- Calendario por curso.
- Anotaciones/comunicaciones personales del estudiante.
- Asistencia y resumen academico.
- Chat interno: modulo experimental/post-MVP presente en el codigo, no tratado como alcance principal validado.
- Notificaciones externas opcionales mediante Telegram.

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
docker compose down -v
docker compose up -d
```

El reinicio con `down -v` elimina el volumen local de MySQL y fuerza la carga automatica de `database/mysql/schema.sql` y `database/mysql/seed.sql` desde `/docker-entrypoint-initdb.d/`.

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
DB_DATABASE=aulafy_db
DB_USERNAME=aulafy_user
DB_PASSWORD=aulafy_pass

JWT_SECRET=clave-demo-local-cambiar-en-produccion
FRONTEND_URL=http://localhost:4200

TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

## Entornos disponibles

Entorno local:

- Frontend: `http://localhost:4200`
- Backend/API: `http://localhost:8080/api`
- Base de datos: MySQL 8.x en Docker Compose.

Entorno AWS de demostracion academica:

- Frontend S3: <http://aulafy-frontend-803615173905.s3-website.us-east-2.amazonaws.com>
- Backend Elastic Beanstalk: <http://aulafy-api-staging.eba-uuqbidym.us-east-2.elasticbeanstalk.com/api>
- Health backend: <http://aulafy-api-staging.eba-uuqbidym.us-east-2.elasticbeanstalk.com/api/health>
- Base de datos: MySQL en Amazon RDS.

El entorno AWS se mantiene como instancia de revision academica controlada. Cualquier cambio de infraestructura debe revisarse antes de ejecutarse para evitar costos innecesarios y no exponer secretos.

## Credenciales demo

- `admin@aulafy.cl` / `Admin1234`
- `colegio@aulafy.cl` / `Colegio1234`
- `profesor@aulafy.cl` / `Profesor1234`
- `apoderado@aulafy.cl` / `Apoderado1234`
- `estudiante@aulafy.cl` / `Estudiante1234`

## Estado actual del MVP

- Backend NestJS con modulos por dominio para autenticacion, usuarios, cursos, calendario, publicaciones, evaluaciones, asistencia, anotaciones y notificaciones.
- Frontend Angular operativo con rutas protegidas y pantallas principales del MVP.
- Base de datos MySQL con esquema y seed demo en `database/mysql`.
- Documentacion academica final disponible en `docs`.
- Chat interno presente como modulo experimental/post-MVP.

## Entrega Semana 5

- **Repositorio:** <https://github.com/Kath-Valenzula/Aulafy> - rama activa: `develop`.
- **Arquitectura real:** cliente-servidor / monolito modular. Un proceso NestJS expone la API REST bajo `/api`; un proceso Angular la consume por HTTP. No hay microservicios ni gateways de mensajeria adicionales.
- **Funcionalidades disponibles:** autenticacion JWT, roles (ADMIN, COLEGIO, PROFESOR, APODERADO, ESTUDIANTE), feed con publicaciones y comentarios, calendario por curso, evaluaciones y notas con calculo de promedio, asistencia con resumen porcentual, anotaciones de estudiante, reporte de riesgo academico, notificaciones externas opcionales por Telegram.
- **Despliegue AWS:** frontend publicado en Amazon S3, backend NestJS publicado en Elastic Beanstalk y base MySQL en Amazon RDS.
- **Correccion reciente:** el modulo `Reportes y riesgo` maneja errores, timeouts y respuestas vacias sin quedar en carga infinita.
- **Levantar el sistema localmente:**

```bash
# Base de datos
docker compose up -d

# Backend
cd backend/aulafy-api-nest
cp .env.example .env
npm install
npm run start:dev

# Frontend (con proxy local hacia backend)
cd frontend/aulafy-web
npm install
npx ng serve --host 0.0.0.0 --proxy-config proxy.conf.json
```

- **Build frontend:** `cd frontend/aulafy-web && npm run build`
- **Build frontend staging:** `cd frontend/aulafy-web && npm run build:staging`
- **Pruebas backend:** `cd backend/aulafy-api-nest && npm test`

## Limitaciones conocidas

- Chat interno experimental: persiste mensajes via REST, sin tiempo real (sin WebSocket).
- Frontend no implementa todo el CRUD disponible en backend: cursos y usuarios son de solo lectura en la interfaz.
- Logout solo en cliente: el JWT sigue siendo valido en el servidor hasta su expiracion de 2h.
- Telegram es opcional: si no hay credenciales, el sistema degrada a modo `NOT_CONFIGURED` sin fallar.
- Dashboard por rol sin indicadores (KPIs) de negocio reales: muestra navegacion por modulos.
- Entorno AWS activo para revision academica; debe mantenerse controlado para evitar costos innecesarios.

## Roadmap

1. Consolidar pruebas automatizadas del stack NestJS/Angular.
2. Completar evidencias de QA y trazabilidad con GitHub Issues.
3. Validar el modulo de chat antes de moverlo al alcance principal.
4. Mantener el despliegue AWS con monitoreo basico, variables seguras y control de costos.
