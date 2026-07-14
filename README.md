# Aulafy

Aulafy es un MVP académico de plataforma web para comunicación y gestión escolar. Centraliza publicaciones, calendario académico, notas, asistencia, anotaciones y mensajería interna para mejorar la coordinación entre colegio, profesores, estudiantes y apoderados.

---

## Estado actual del MVP

El sistema está desplegado en AWS y disponible para revisión académica. Los módulos principales están operativos. El rol contextual del docente (`role_in_course`) está implementado en backend y frontend: los permisos de HEAD_TEACHER y SUBJECT_TEACHER son distintos.

**Resultados de pruebas backend (Semana 8):**

- 12 suites aprobadas.
- 99 tests aprobados.
- Statements: 69,30 % / Branches: 48,12 % / Functions: 59,66 % / Lines: 68,24 %.

> **Nota:** Los resultados de pruebas corresponden al commit `265b2cb` (PR #6, mergeado en `develop` el 2026-07-13). Todos los módulos están desplegados en AWS. Smoke test aprobado.

---

## Arquitectura

El backend NestJS expone una API REST bajo `/api`. El frontend corresponde a una SPA Angular compilada y servida como archivos estáticos desde Amazon S3. La aplicación consume la API REST NestJS por HTTP. La base de datos es MySQL gestionada con TypeORM. No se usan microservicios.

---

## Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | Angular + TypeScript | 21.2.x (instalada 21.2.14) |
| Backend | NestJS + TypeScript | 11.x |
| Runtime backend y deploy EB | Node.js | 22.x |
| ORM | TypeORM | — |
| Base de datos | MySQL | 8.x |
| Autenticación | JWT (jsonwebtoken) | — |
| Documentación API | Swagger / OpenAPI | — |
| CI/CD | GitHub Actions | — |
| Notificaciones externas | Telegram Bot API (opcional) | — |

---

## Módulos implementados

| Módulo | Estado | Ruta o endpoint |
|--------|--------|----------------|
| Autenticación JWT | Activo | `/login` |
| Gestión de usuarios y roles | Activo | `/app/users` |
| Cursos y asignaturas | Activo | `/app/courses` |
| Muro académico (feed) | Activo | `/app/feed` |
| Calendario por curso | Activo | `/app/calendar` |
| Evaluaciones y notas | Activo | `/app/academic` |
| Asistencia | Activo | `/app/attendance` |
| Anotaciones | Activo | `/app/annotations` |
| Chat interno por curso (múltiples salas, solo HEAD_TEACHER administra) | Activo | `/app/chat` |
| Riesgo académico | Activo | `/app/risk` |
| Notificaciones externas Telegram | Interno (no expuesto en UI del MVP) | — |
| Health check | Activo | `/api/health` |
| Documentación Swagger | Activo | `/api/docs` |

---

## Roles y permisos

### Roles generales (claim en JWT)

| Rol | Descripción |
|-----|------------|
| ADMIN | Administración global de usuarios y configuración |
| COLEGIO | Coordinación institucional |
| PROFESOR | Docente; se subdivide por `role_in_course` dentro de cada curso |
| APODERADO | Familiar o tutor del estudiante |
| ESTUDIANTE | Alumno del establecimiento |

### Rol contextual del docente (`role_in_course`)

El campo `role_in_course` en la tabla `course_teachers` determina qué puede hacer cada profesor dentro de un curso específico. No forma parte del JWT; se consulta desde la base de datos en las operaciones que requieren autorización contextual por curso.

| Valor | Acceso |
|-------|--------|
| HEAD_TEACHER | Acceso integral del curso: anotaciones conductuales, eventos generales (REUNION, ACTIVIDAD, COMUNICADO), riesgo académico, mensajes del curso, notificaciones institucionales |
| SUBJECT_TEACHER | Acceso académico acotado: cursos asignados, muro, calendario (PRUEBA, TAREA), evaluaciones y notas, asistencia, anotaciones académicas |
| ASSISTANT | Rol definido en el modelo de datos; alcance funcional específico pendiente de validación formal |

### Diferenciación HEAD_TEACHER / SUBJECT_TEACHER

La diferenciación contextual se implementa en backend mediante `AcademicAccessService` y validaciones específicas en los servicios de calendario, muro, anotaciones, académico, chat, riesgo y notificaciones. `RolesGuard` valida exclusivamente los roles generales incluidos en el JWT.

- Las anotaciones conductuales requieren `HEAD_TEACHER`.
- Los eventos generales (REUNION, ACTIVIDAD, COMUNICADO) requieren `HEAD_TEACHER`.
- El reporte de riesgo académico está disponible para ADMIN, COLEGIO y `HEAD_TEACHER`.
- `SUBJECT_TEACHER` no accede al reporte de riesgo ni a notificaciones institucionales.
- `SUBJECT_TEACHER` queda bloqueado para listar salas, crear salas, leer mensajes y enviar mensajes del chat general. La corrección está validada mediante pruebas automatizadas (commit `5d05e41`, PR #4) y smoke test en AWS (2026-07-12).
- Un mismo usuario puede ser `HEAD_TEACHER` en un curso y `SUBJECT_TEACHER` en otro.

El backend constituye la autoridad final de autorización mediante `role_in_course`. El frontend obtiene `myRoleInCourse` desde `/api/courses` y mantiene un estado restrictivo mientras carga los permisos o si la consulta falla.

### Módulo de riesgo académico

Identifica estudiantes con bajo rendimiento según umbrales fijos: promedio inferior a 4,0 o asistencia inferior al 85 %. No corresponde a riesgo conductual ni disciplinario. Acceso disponible para ADMIN, COLEGIO y PROFESOR con rol `HEAD_TEACHER` en el curso correspondiente.

---

## Infraestructura AWS

| Componente | Servicio | URL |
|-----------|---------|-----|
| Frontend | Amazon S3 Static Website | http://aulafy-frontend-803615173905.s3-website.us-east-2.amazonaws.com |
| Backend | AWS Elastic Beanstalk | http://aulafy-api-staging.eba-uuqbidym.us-east-2.elasticbeanstalk.com/api |
| Health check | AWS Elastic Beanstalk | http://aulafy-api-staging.eba-uuqbidym.us-east-2.elasticbeanstalk.com/api/health |
| API Docs (Swagger) | AWS Elastic Beanstalk | http://aulafy-api-staging.eba-uuqbidym.us-east-2.elasticbeanstalk.com/api/docs |
| Base de datos | Amazon RDS MySQL 8.x | Amazon RDS MySQL conectado al backend Elastic Beanstalk; endpoint y credenciales no publicados |

El entorno AWS es una instancia de revisión académica controlada, no un entorno de producción final. La comunicación es por HTTP; HTTPS no está activo en el staging actual.

---

## Instalación local

### Base de datos

```bash
docker compose down -v
docker compose up -d
```

El reinicio con `down -v` elimina el volumen local y fuerza la carga de `database/mysql/schema.sql` y `database/mysql/seed.sql`.

### Backend

```bash
cd backend/aulafy-api-nest
cp .env.example .env
npm install
npm run start:dev
```

> Nota técnica: el lockfile del backend presenta una desincronización que impide el uso de `npm ci` en entornos Linux limpios. Se usa `npm install` como alternativa mientras se resuelve en Semana 8.

### Frontend

```bash
cd frontend/aulafy-web
npm install
npx ng serve --host 0.0.0.0 --proxy-config proxy.conf.json
```

La interfaz queda disponible en `http://localhost:4200`. El proxy local redirige `/api` hacia `http://localhost:8080/api`.

---

## Variables de entorno

Copiar `.env.example` a `.env` en el directorio del backend y completar los valores:

```env
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

Las variables de Telegram son opcionales. Si no se configuran, el sistema opera en modo `NOT_CONFIGURED` sin fallar.

---

## Usuarios demo

Los usuarios base están disponibles mediante `database/mysql/seed.sql`. Los usuarios Profesor Jefe Demo y Profesor Asignatura Demo se incorporan mediante `database/mysql/migrations/20260705_seed_profesor_jefe_asignatura_demo.sql`, migración ya aplicada en el RDS de staging.

| Email | Contraseña | Rol JWT | role_in_course |
|-------|-----------|---------|----------------|
| admin@aulafy.cl | Admin1234 | ADMIN | — |
| colegio@aulafy.cl | Colegio1234 | COLEGIO | — |
| profesor.jefe@aulafy.cl | ProfesorJefe1234 | PROFESOR | HEAD_TEACHER |
| profesor.asignatura@aulafy.cl | ProfesorAsignatura1234 | PROFESOR | SUBJECT_TEACHER |
| apoderado@aulafy.cl | Apoderado1234 | APODERADO | — |
| estudiante@aulafy.cl | Estudiante1234 | ESTUDIANTE | — |

---

## Pruebas y cobertura

```bash
cd backend/aulafy-api-nest
npm test
npm run test:coverage
```

Resultados actuales del backend (medición Semana 8):

| Métrica | Resultado |
|---------|----------|
| Suites | 12 |
| Tests | 99 PASS |
| Statements | 69,30 % |
| Branches | 48,12 % |
| Functions | 59,66 % |
| Lines | 68,24 % |

**Módulos con mayor cobertura:** Auth (~95 %), Risk (~88 %), Annotations, RolesGuard, Chat (~72 %).
**Módulos con menor cobertura:** Notifications (21 %), Users (18 %), Courses (38 %).

El frontend no cuenta con pruebas unitarias automatizadas en esta etapa del MVP.

---

## Rendimiento en staging (Semana 8)

Medición sobre AWS en modo desktop (Chrome, sin caché).

| Métrica | Valor |
| ------- | ----- |
| Health endpoint — promedio (10 req) | 190,97 ms |
| Health endpoint — mínimo | 150,44 ms |
| Health endpoint — máximo | 424,65 ms |
| Health endpoint — p50 | 163,36 ms |
| DOMContentLoaded (sesión fría) | 714 ms |
| Load event (sesión fría) | 1,67 s |
| Lighthouse Performance (desktop) | 75 / 100 |
| FCP | 1,6 s |
| LCP | 2,0 s |
| TBT | 210 ms |
| CLS | 0 |
| Bundle inicial (gzip) | 82,03 kB |
| Elastic Beanstalk CPU | 0,312 % |
| RDS conexiones activas | 4 |
| RDS CPU | ~4,15 % |

---

## CI/CD

Los workflows de GitHub Actions se encuentran en `.github/workflows/`:

| Archivo | Descripción |
|---------|------------|
| `backend-nest-ci.yml` | Integración continua del backend: build y tests en cada push |
| `frontend-angular-ci.yml` | Integración continua del frontend: build en cada push |
| `backend-aws-eb-deploy.yml` | Despliegue manual del backend en AWS Elastic Beanstalk |
| `frontend-aws-s3-deploy.yml` | Despliegue manual del frontend en Amazon S3 |

---

## Estructura del repositorio

```
Aulafy/
├── backend/aulafy-api-nest/    # API NestJS con módulos por dominio
├── frontend/aulafy-web/        # Aplicación Angular (SPA)
├── database/mysql/             # schema.sql, seed.sql y migraciones
├── docs/                       # Documentación académica por semana
│   ├── semana-7/               # Documentación y evidencias Semana 7
│   ├── semana-8/               # Documentación y evidencias Semana 8
│   └── sumativa-2/             # Área de trabajo para actualizar los siete documentos de la Sumativa 2
├── .github/workflows/          # CI/CD GitHub Actions
└── docker-compose.yml          # Base de datos local
```

---

## Limitaciones del staging académico

| Limitación | Descripción |
|-----------|------------|
| Sin HTTPS | S3 y Elastic Beanstalk en HTTP |
| Logout solo en cliente | El token JWT continúa siendo válido en el servidor hasta su expiración de 1 día |
| Umbrales de riesgo fijos | promedio < 4,0 y asistencia < 85 %, no configurables por interfaz |
| Chat sin tiempo real | Implementado vía REST; requiere recarga manual para ver mensajes nuevos |
| role_in_course fuera del JWT | Se consulta desde la base de datos en operaciones con autorización contextual |
| Reproducibilidad en Linux | `npm ci` backend falla en entorno Linux limpio; en revisión durante Semana 8 |
| Frontend sin pruebas automatizadas | No hay suite de pruebas unitarias en el frontend |

---

## Documentación del proyecto

La carpeta `docs/` contiene la documentación académica organizada por etapa:

| Ruta | Contenido |
|------|----------|
| `docs/FICHA_ESTADO_REAL_AULAFY.md` | Fuente única de verdad: stack, URLs, tests, roles y deuda técnica |
| `docs/semana-7/` | Evidencias, documento de avance y capturas de pantalla |
| `docs/semana-8/` | QA, registros de defectos, no conformidades y backlog técnico |
| `docs/sumativa-2/` | Área de trabajo para la actualización de los siete documentos de la Sumativa 2 |

---

## Integrantes

- Katherine Gisselle Valenzuela Moreno
- Sebastián Alberto Briceño Inostroza

Profesor: Alonso Esteban Castillo Pizarro
Curso: TSY2201 — Proyecto de Título
