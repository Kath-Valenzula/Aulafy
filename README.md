# Aulafy

Aulafy es un MVP academico de plataforma web para comunicacion y gestion escolar. Centraliza publicaciones, calendario academico, notas, asistencia y anotaciones para mejorar la coordinacion entre colegio, profesores, estudiantes y apoderados.

El stack oficial vigente es:

- Frontend Angular 21 con TypeScript.
- Backend NestJS con Node.js y TypeScript.
- Base de datos MySQL 8.x.
- ORM TypeORM.
- Docker Compose para base de datos local.
- Pruebas backend automatizadas con Jest.
- Control de versiones en GitHub y seguimiento mediante GitHub Issues.
- Telegram Bot API solo como integracion opcional para notificaciones externas.
- AWS como entorno de demostracion academica: frontend en Amazon S3, backend en Elastic Beanstalk y base de datos MySQL en Amazon RDS.

## Integrantes

- Katherine Gisselle Valenzuela Moreno
- Sebastián Alberto Briceño Inostroza

Profesor: Alonso Esteban Castillo Pizarro

## Stack tecnico

- Backend: NestJS, Node.js, TypeScript, JWT, TypeORM, class-validator.
- Frontend: Angular 21, TypeScript, SCSS, Angular Router, Reactive Forms, HttpClient.
- Base de datos: MySQL 8 mediante Docker Compose en local y Amazon RDS en AWS.
- Pruebas: Jest en backend con suites unitarias y de permisos.
- Integraciones: Telegram Bot API para avisos externos opcionales.

## Arquitectura

El proyecto sigue una arquitectura cliente-servidor. El backend NestJS modular expone una API REST bajo `/api`; el frontend Angular la consume por HTTP. La base de datos es MySQL gestionada con TypeORM. El despliegue se realiza en AWS.

Estructura del repositorio:

- `frontend/aulafy-web`: aplicacion Angular mobile-first.
- `backend/aulafy-api-nest`: API NestJS con modulos por dominio.
- `database/mysql`: scripts oficiales de esquema y datos demo en MySQL.
- `docs`: documentacion academica del proyecto, avances semanales e imagenes de evidencia.
- `.github/workflows`: integracion continua y flujos manuales de despliegue AWS.

No se usan microservicios porque el MVP requiere simplicidad operativa, menor costo y trazabilidad clara para entrega academica.

## Modulos principales

- Auth y seguridad JWT.
- Gestion de usuarios y roles.
- Cursos, asignaturas y evaluaciones. Profesor jefe formalizado con campo `role_in_course` en `course_teachers`. Los valores considerados son `HEAD_TEACHER`, `SUBJECT_TEACHER` y `ASSISTANT`. En el MVP todos los profesores asignados a un curso mantienen permisos operativos completos; la diferenciacion fina de permisos segun `role_in_course` queda como mejora futura.
- Feed academico tipo red social.
- Calendario por curso.
- Anotaciones/comunicaciones personales del estudiante.
- Asistencia y resumen academico.
- Modulo de riesgo academico (`risk`): identifica estudiantes con bajo rendimiento (promedio inferior a 4.0) o baja asistencia (inferior al 85%). No corresponde a riesgo conductual ni disciplinario. Acceso restringido a los roles ADMIN y COLEGIO.
- Chat interno por curso ("Mensajes del curso"): comunicacion interna entre PROFESOR, APODERADO y ESTUDIANTE dentro de cada curso. Disponible en frontend mediante la ruta `/app/chat`, implementado en backend mediante el modulo `chat` via API REST. La mensajeria en tiempo real con WebSocket queda como mejora futura.
- Notificaciones externas opcionales mediante Telegram (solo canal de aviso externo, no es el chat principal).

## Roles

- `ADMIN`
- `COLEGIO`
- `PROFESOR`
- `APODERADO`
- `ESTUDIANTE`

Para el MVP cada usuario tiene un rol principal. La estructura queda preparada para extender permisos si luego se requiere un modelo de multiples roles.

## Entorno de revision AWS

El entorno principal para revision academica esta publicado en AWS:

- Frontend S3: <http://aulafy-frontend-803615173905.s3-website.us-east-2.amazonaws.com>
- Backend Elastic Beanstalk: <http://aulafy-api-staging.eba-uuqbidym.us-east-2.elasticbeanstalk.com/api>
- Health backend: <http://aulafy-api-staging.eba-uuqbidym.us-east-2.elasticbeanstalk.com/api/health>
- Base de datos: MySQL en Amazon RDS.

El entorno AWS se mantiene como instancia de revision academica controlada. Cualquier cambio de infraestructura debe revisarse antes de ejecutarse para evitar costos innecesarios y no exponer secretos.

## Ejecucion local para desarrollo

La ejecucion local se conserva para desarrollo, pruebas y correcciones. No reemplaza al entorno AWS de revision.

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
npx ng serve --host 0.0.0.0 --proxy-config proxy.conf.json
```

La interfaz queda disponible en `http://localhost:4200` y el proxy local redirige `/api` hacia `http://localhost:8080/api`.

## Variables de entorno local

```bash
NODE_ENV=development
PORT=8080

DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=aulafy_db
DB_USERNAME=aulafy_user
DB_PASSWORD=CAMBIAR_POR_PASSWORD_LOCAL

JWT_SECRET=CAMBIAR_POR_SECRETO_SEGURO_DE_64_CARACTERES
FRONTEND_URL=http://localhost:4200

TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

## Credenciales demo

- `admin@aulafy.cl` / `Admin1234`
- `colegio@aulafy.cl` / `Colegio1234`
- `profesor@aulafy.cl` / `Profesor1234`
- `apoderado@aulafy.cl` / `Apoderado1234`
- `estudiante@aulafy.cl` / `Estudiante1234`

## Estado actual del MVP

- Backend NestJS con modulos por dominio para autenticacion, usuarios, cursos, calendario, publicaciones, evaluaciones, asistencia, anotaciones, chat y notificaciones.
- Frontend Angular operativo con rutas protegidas y pantallas principales del MVP.
- Base de datos MySQL con esquema y seed demo en `database/mysql`. Seed incluye 3 estudiantes demo con diferentes perfiles de riesgo academico.
- Chat interno por curso activo para PROFESOR, APODERADO y ESTUDIANTE. Telegram solo envia avisos externos opcionales.
- Profesor jefe formalizado: campo `role_in_course` en tabla `course_teachers`. El profesor demo figura como `HEAD_TEACHER`.
- Reporte de riesgo academico con umbrales configurados: promedio < 4.0 y asistencia < 85%. Acceso exclusivo para ADMIN y COLEGIO.
- Documentacion academica y evidencias disponibles en la carpeta `docs`, organizadas por semana de avance.

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

## Entrega Semana 6

- **Repositorio:** <https://github.com/Kath-Valenzula/Aulafy> — rama activa: `develop`.
- **Frontend AWS S3 Static Website:** <http://aulafy-frontend-803615173905.s3-website.us-east-2.amazonaws.com> (HTTP, staging académico).
- **Backend AWS Elastic Beanstalk health:** <http://aulafy-api-staging.eba-uuqbidym.us-east-2.elasticbeanstalk.com/api/health>
- **Tipo de entorno:** demostración académica. No es producción final. Los recursos AWS están activos únicamente para revisión y se mantienen controlados para evitar costos innecesarios.

### Mejoras técnicas aplicadas en Semana 6

**Seguridad mínima:**

- CORS restringido: se reemplazó `cors: true` abierto por una lista explícita de orígenes permitidos (localhost de desarrollo, frontend AWS, variable `FRONTEND_URL`).
- Helmet agregado: cabeceras HTTP de seguridad configuradas con modo conservador para API REST (`contentSecurityPolicy: false`, `crossOriginEmbedderPolicy: false`).
- `.env.example` actualizado con placeholders seguros; sin contraseñas reales en el repositorio.
- `deploy-aws.sh` ajustado para no imprimir credenciales en consola y no dejar MySQL abierto a `0.0.0.0/0` en futuras recreaciones.

**Calidad:**

- `test:coverage` agregado con Jest. Resultados de la línea base medida:
  - Statements: 61.45% / Branches: 39.42% / Functions: 47.85% / Lines: 59.50%
- Backend: 7 suites, 27 tests, todos pasando.
- `sonar-project.properties` preparado para integración futura con SonarQube/SonarCloud, sin tokens ni credenciales.
- Se eliminó la dependencia de Google Fonts para la tipografía general del sistema. La interfaz utiliza fuentes del sistema (`system-ui`, `Segoe UI`, `sans-serif`), manteniendo únicamente Material Symbols Outlined para la representación de íconos del menú y acciones visuales.
- `npm audit` ejecutado y vulnerabilidades documentadas. No se aplicó `audit fix --force` para evitar cambios no controlados en dependencias críticas.

**Mejoras de despliegue proyectadas (no activas actualmente):**

- CloudFront para servir el frontend con HTTPS.
- AWS Certificate Manager (ACM) para certificado HTTPS si se dispone de dominio propio.
- AWS Budget mensual para control de costos del staging.
- Secretos migrados a AWS SSM Parameter Store o Secrets Manager.
- RDS MySQL restringida a acceso privado desde el backend (sin acceso público a Internet).

Los scripts base para estas mejoras están disponibles en `scripts/aws/`.

### Comandos de validación Semana 6

```bash
# Backend
cd backend/aulafy-api-nest
npm run build          # compilar TypeScript
npm test               # 7 suites, 27 tests
npm run test:coverage  # cobertura Jest

# Frontend
cd frontend/aulafy-web
npm run build          # build de produccion
```

## Limitaciones conocidas

- Chat interno por curso: persiste mensajes via REST, sin tiempo real (sin WebSocket). La pantalla no se actualiza automaticamente; hay que recargar para ver mensajes nuevos.
- Profesor jefe: `role_in_course` ya esta implementado como dato. Los permisos aun no estan diferenciados por rol del docente; todos los docentes del curso tienen igual nivel de acceso en el MVP actual.
- Reporte de riesgo: los umbrales (promedio < 4.0, asistencia < 85%) estan fijados en el codigo backend. No son configurables por la interfaz.
- Frontend no implementa todo el CRUD disponible en backend: cursos y usuarios son de solo lectura en la interfaz.
- Logout solo en cliente: el JWT sigue siendo valido en el servidor hasta su expiracion de 2h.
- Telegram es opcional: si no hay credenciales, el sistema degrada a modo `NOT_CONFIGURED` sin fallar.
- Dashboard por rol sin indicadores (KPIs) de negocio reales: muestra navegacion por modulos.
- Entorno AWS activo para revision academica de alcance academico. No es produccion final. HTTPS no esta activo; el frontend se sirve por HTTP desde S3 Static Website.

## Roadmap

1. Consolidar pruebas automatizadas del stack NestJS/Angular.
2. Completar evidencias de QA y trazabilidad con GitHub Issues.
3. Completar cobertura de pruebas para el modulo de chat.
4. Mantener el despliegue AWS con monitoreo basico, variables seguras y control de costos.
5. Activar CloudFront con HTTPS para el frontend.
6. Configurar AWS Budget mensual para control de costos del staging.
7. Migrar secretos a AWS SSM Parameter Store o Secrets Manager.
8. Restringir RDS a acceso privado desde el backend, eliminando la apertura publica usada en el entorno de demo academica.
