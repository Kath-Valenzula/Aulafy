# Semana 7 — Taller Aplicado de Software

## Formato de respuesta · Finalizando el desarrollo de la solución

**Proyecto:** Aulafy  
**Nombre estudiante:** Katherine Gisselle Valenzuela Moreno · Sebastián Alberto Briceño Inostroza  
**Asignatura:** Taller Aplicado de Software  
**Carrera:** Ingeniería en Desarrollo de Software  
**Profesor:** Alonso Esteban Castillo Pizarro  
**Fecha:** 5 de julio de 2026  
**Rama de entrega:** `develop` (integración vía `semana-7-new`)  
**Repositorio:** https://github.com/Kath-Valenzula/Aulafy

> **Nota de uso:** Este archivo Markdown es la fuente para generar el documento oficial DOCX (`TSY2201_EXP2_S7_Formato_respuesta_Aulafy_Semana7.docx`). Los marcadores `[PENDIENTE]` deben completarse antes de la entrega final.

---

## Contenido

1. [Link con información del proyecto](#1-link-con-información-del-proyecto)
2. [Link con acceso al sistema](#2-link-con-acceso-al-sistema)
3. [Avance](#3-avance)
   - 3.1 [Estado general del avance](#31-estado-general-del-avance)
   - 3.2 [Funcionalidades implementadas y disponibles](#32-funcionalidades-implementadas-y-disponibles)
   - 3.3 [Definiciones de alcance acordadas con el docente](#33-definiciones-de-alcance-acordadas-con-el-docente)
   - 3.4 [Aspectos técnicos de implementación](#34-aspectos-técnicos-de-implementación)
   - 3.5 [Gestión del proyecto](#35-gestión-del-proyecto)
   - 3.6 [Validaciones y pruebas finales](#36-validaciones-y-pruebas-finales)
   - 3.7 [Documentos y archivos actualizados](#37-documentos-y-archivos-actualizados)
   - 3.8 [Cuentas demo para revisión](#38-cuentas-demo-para-revisión)
   - 3.9 [Limitaciones conocidas y mejoras futuras](#39-limitaciones-conocidas-y-mejoras-futuras)
   - 3.10 [Evidencias](#310-evidencias)

---

## 1. Link con información del proyecto

**Repositorio GitHub:** https://github.com/Kath-Valenzula/Aulafy

El proyecto Aulafy se encuentra versionado en GitHub en un repositorio público con acceso de revisión. El repositorio contiene:

- Código fuente del **frontend Angular 21** (`frontend/aulafy-web`).
- Código fuente del **backend NestJS** (`backend/aulafy-api-nest`).
- Scripts oficiales de base de datos MySQL (`database/mysql`).
- Documentación académica organizada por semana (`docs/`).
- Workflows de integración continua y despliegue AWS (`.github/workflows/`).
- Scripts de apoyo para despliegue y control de costos (`scripts/aws/`).

Los avances de Semana 7 se respaldan en la rama **`develop`**, con trazabilidad mediante commits incrementales y GitHub Issues. La organización del repositorio separa responsabilidades por capa: frontend, backend, base de datos, documentación, CI/CD y scripts de infraestructura.

**Rama activa de integración:** `semana-7-new`  
**Rama base:** `develop`

---

## 2. Link con acceso al sistema

| Componente | URL |
|------------|-----|
| **Frontend (Vercel — HTTPS)** | https://aulafy-web.vercel.app |
| **Frontend (AWS S3)** | http://aulafy-frontend-803615173905.s3-website.us-east-2.amazonaws.com |
| **Backend (AWS Elastic Beanstalk)** | http://aulafy-api-staging.eba-uuqbidym.us-east-2.elasticbeanstalk.com/api |
| **Health check (directo)** | http://aulafy-api-staging.eba-uuqbidym.us-east-2.elasticbeanstalk.com/api/health |
| **Health vía Vercel (proxy)** | https://aulafy-web.vercel.app/api/health |

**Entorno de respaldo** (misma versión Semana 7, por si no alcanza el redeploy en AWS del equipo):

| Componente | URL |
|------------|-----|
| Frontend AWS S3 (respaldo) | http://aulafy-frontend-605134438568.s3-website.us-east-2.amazonaws.com |
| Backend EB (respaldo) | http://aulafy-api-staging-sbriceno.eba-57zmbb7c.us-east-2.elasticbeanstalk.com/api |
| Health (respaldo) | http://aulafy-api-staging-sbriceno.eba-57zmbb7c.us-east-2.elasticbeanstalk.com/api/health |

El sistema Aulafy se mantiene desplegado en un **entorno de demostración académica (staging)** en AWS:

- **Frontend principal de revisión:** Vercel (HTTPS) o AWS S3 del equipo.
- **Backend:** AWS Elastic Beanstalk (API NestJS) — entorno Kath.
- **Base de datos:** Amazon RDS MySQL 8.x.

El acceso permite revisar inicio de sesión con usuarios demo, navegación diferenciada por roles, dashboards y módulos académicos implementados. El endpoint `/api/health` confirma que el backend está activo.

**Declaración de entorno:** staging académico, no producción final. Vercel sirve HTTPS; S3 utiliza HTTP. Para un entorno productivo se proyecta Amazon CloudFront con certificado HTTPS (AWS Certificate Manager).

**Nota Semana 7:** El frontend en S3 del equipo puede requerir redeploy (GitHub Actions necesita variables en environment `staging`). Vercel evidencia la versión actual del MVP con chat y riesgo académico operativos contra el backend Beanstalk. Existe un entorno AWS de respaldo con la versión Semana 7 desplegada (ver tabla arriba). Evidencias en `docs/semana-7/evidencias/`.

---

## 3. Avance

### 3.1 Estado general del avance

Aulafy alcanza en Semana 7 la etapa de **cierre del MVP**. El foco de esta entrega es:

1. Completar y validar las funcionalidades planificadas.
2. Revisar el cumplimiento de criterios de aceptación.
3. Ejecutar **pruebas finales** (caja blanca, negra y gris).
4. Mantener el sistema accesible en AWS para revisión del docente.
5. Documentar de forma clara el estado final del producto.

**Arquitectura implementada:** cliente-servidor con backend **monolito modular** (NestJS). **No se utilizan microservicios** en esta etapa. El backend organiza su lógica en módulos internos por dominio (auth, users, courses, academic, feed, chat, risk, etc.). El frontend Angular consume la API REST bajo `/api`.

**Integración continua:** GitHub Actions ejecuta build y tests automáticos en push a `develop`. Los despliegues a AWS se realizan mediante workflows manuales (`workflow_dispatch`).

**Contenedores:** Docker Compose gestiona MySQL en desarrollo local. El backend incluye `Dockerfile` para despliegue containerizado (ECS), aunque el entorno académico activo de revisión utiliza Elastic Beanstalk.

### 3.2 Funcionalidades implementadas y disponibles

Las siguientes funcionalidades se encuentran implementadas y disponibles para revisión (local y/o AWS):

| Módulo | Descripción | Roles | Estado |
|--------|-------------|-------|--------|
| **Autenticación** | Login JWT, control de sesión, guards por rol | Todos | ✅ Completo |
| **Dashboard** | Navegación principal por perfil | ADMIN, COLEGIO, PROFESOR | ✅ Completo |
| **Dashboard familia** | Vista principal apoderado/estudiante | APODERADO, ESTUDIANTE | ✅ Completo |
| **Usuarios** | Gestión y visualización de usuarios | ADMIN, COLEGIO | ✅ UI solo lectura |
| **Cursos y asignaturas** | Visualización de cursos y materias | ADMIN, COLEGIO, PROFESOR | ✅ UI solo lectura |
| **Muro académico (Feed)** | Publicaciones, comunicados y comentarios | COLEGIO, PROFESOR, APODERADO, ESTUDIANTE | ✅ Completo |
| **Calendario** | Eventos académicos por curso | COLEGIO, PROFESOR, APODERADO, ESTUDIANTE | ✅ Completo |
| **Notas y evaluaciones** | Visualización de evaluaciones y promedios | PROFESOR, APODERADO, ESTUDIANTE | ✅ Completo |
| **Asistencia** | Registro y resumen porcentual | PROFESOR, APODERADO, ESTUDIANTE | ✅ Completo |
| **Anotaciones** | Anotaciones académicas/conductuales | PROFESOR | ✅ Completo |
| **Chat interno** | Mensajes del curso (REST) | PROFESOR, APODERADO, ESTUDIANTE | ✅ Completo |
| **Riesgo académico** | Alerta por bajo rendimiento o asistencia | ADMIN, COLEGIO, **PROFESOR** | ✅ Completo |
| **Notificaciones Telegram** | Avisos externos opcionales | ADMIN, COLEGIO, PROFESOR | ✅ Opcional |
| **Perfil** | Datos del usuario vinculado | APODERADO, ESTUDIANTE | ✅ Completo |
| **Health check** | Verificación de servicio activo | Público | ✅ Completo |

**Funcionalidades no incluidas en el MVP (mejora futura):**

- Mensajería en tiempo real (WebSocket).
- Permisos diferenciados por `role_in_course` en anotaciones y calendario (HEAD_TEACHER vs SUBJECT_TEACHER). Otras acciones docentes mantienen permisos operativos completos en el MVP.
- CRUD completo de cursos/usuarios desde la interfaz.
- HTTPS con CloudFront (proyectado, no activo).
- Invalidación server-side de JWT al cerrar sesión.

### 3.3 Definiciones de alcance acordadas con el docente

Respuestas formales a las observaciones de la retroalimentación Semana 5:

#### Chat — ¿Dentro o fuera del MVP?

**Decisión:** El chat queda **DENTRO del MVP final** (Opción B).

- Implementado en backend (`/api/chat/rooms`, mensajes por sala).
- Implementado en frontend (`/app/chat`, navegación "Mensajes del curso").
- Disponible para PROFESOR (crear salas y mensajes), APODERADO y ESTUDIANTE (leer/responder en salas visibles).
- **Limitación declarada:** persistencia vía REST, sin WebSocket. La pantalla requiere recarga manual para ver mensajes nuevos.

#### Profesor jefe — ¿Implementado?

**Decisión:** Formalizado a nivel de modelo de datos.

- Campo `role_in_course` en tabla `course_teachers`.
- Valores: `HEAD_TEACHER`, `SUBJECT_TEACHER`, `ASSISTANT`.
- Profesor demo registrado como `HEAD_TEACHER`.
- **Limitación declarada:** en el MVP la moderación del chat y permisos granulares en todos los módulos docentes quedan como mejora futura. `role_in_course` ya diferencia permisos en anotaciones y calendario.

#### Módulo de riesgo — ¿Qué funcionalidad tiene?

**Definición:** Riesgo **académico**, no conductual ni disciplinario.

- Identifica estudiantes con promedio inferior a **4.0** o asistencia inferior al **85%**.
- Acceso restringido a roles **ADMIN** y **COLEGIO**.
- Endpoint: `GET /api/risk/academic`.
- Datos demo: Ana Gómez (riesgo académico), Carlos Pérez (riesgo por asistencia).

#### Rol COLEGIO vs ADMIN

- **ADMIN:** administración global del sistema.
- **COLEGIO:** operación institucional del establecimiento (publicaciones, cursos, calendario, reportes).

### 3.4 Aspectos técnicos de implementación

#### Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Angular 21, TypeScript, SCSS, Reactive Forms |
| Backend | NestJS, Node.js, TypeScript, JWT, class-validator |
| Base de datos | MySQL 8.x, TypeORM |
| Pruebas | Jest (backend) |
| CI/CD | GitHub Actions |
| Cloud | AWS S3, Elastic Beanstalk, RDS |
| Local | Docker Compose (MySQL) |

#### Seguridad implementada

- Autenticación JWT con expiración de 2 horas.
- Autorización por roles en backend (guards) y frontend (route guards).
- CORS restringido a orígenes explícitos (localhost, frontend AWS, `FRONTEND_URL`).
- Helmet con cabeceras HTTP de seguridad (configuración conservadora para API REST).
- Variables sensibles en `.env` (no publicadas en repositorio).
- Placeholders seguros en `.env.example`.

#### Integración continua y despliegue

| Workflow | Trigger | Acción |
|----------|---------|--------|
| `backend-nest-ci.yml` | Push a `develop` | Build + tests backend |
| `frontend-angular-ci.yml` | Push a `develop` | Build staging frontend |
| `frontend-aws-s3-deploy.yml` | Manual | Deploy frontend a S3 |
| `backend-aws-ecs-deploy.yml` | Manual | Deploy backend containerizado |

#### Pasos para levantar localmente

```bash
# Base de datos
docker compose up -d

# Backend
cd backend/aulafy-api-nest
cp .env.example .env
npm install
npm run start:dev

# Frontend
cd frontend/aulafy-web
npm install
npx ng serve --host 0.0.0.0 --proxy-config proxy.conf.json
```

### 3.5 Gestión del proyecto

#### Gestión de la integración

- Los cambios se integran mediante **Pull Requests** hacia `develop`.
- Cada funcionalidad se desarrolla en ramas feature (`feature/semana-7-documentacion-cierre`, `feature/semana-8-cierre-mvp-chat-profesor-jefe`, etc.).
- Los cambios de alcance (chat en MVP, `role_in_course`, riesgo académico) se documentaron en README y en respuestas al docente.

#### Gestión del alcance

- El MVP se mantiene alineado a los entregables definidos en la propuesta inicial y Formativa 2.
- Funcionalidades fuera de alcance se declaran explícitamente como mejoras futuras (WebSocket, permisos granulares, HTTPS productivo).
- No se incorporaron funcionalidades no planificadas sin documentar su impacto.

#### Gestión del cronograma

- Seguimiento mediante **GitHub Issues** y entregables semanales documentados en `docs/`.
- Avance por fases: propuesta (S1–S3) → diseño (S4) → desarrollo y despliegue (S5–S6) → cierre MVP (S7).

#### Gestión de la calidad

- Revisiones de código en equipo antes de merge a `develop`.
- Pruebas automatizadas backend con Jest.
- Pruebas manuales de aceptación en entorno AWS.
- Informe de resultados documentado en sección 3.6.

### 3.6 Validaciones y pruebas finales

#### 3.6.1 Pruebas de caja blanca (automáticas — backend)

Ejecutadas con Jest sobre la lógica interna de servicios:

```bash
cd backend/aulafy-api-nest
npm run build    # Compilación TypeScript
npm test         # Suites unitarias
npm run test:coverage  # Cobertura de código
```

| Métrica | Semana 6 (referencia) | Semana 7 (actual) |
|---------|----------------------|-------------------|
| Suites | 7 | **10** |
| Tests | 27 | **56** |
| Statements | 61.45% | **64.87%** |
| Branches | 39.42% | **43.52%** |
| Functions | 47.85% | **52.21%** |
| Lines | 59.50% | **63.90%** |

**Módulos con tests:**

- Auth (`auth.service.spec.ts`)
- Courses (`courses.service.spec.ts`)
- Chat (`chat.service.spec.ts`) — incluye permisos APODERADO
- Annotations (`annotations.service.spec.ts`)
- Risk (`risk.service.spec.ts`, `risk-permissions.spec.ts`)
- Annotations permissions (`annotations-role-permissions.spec.ts`)
- Calendar permissions (`calendar-role-permissions.spec.ts`)
- Academic Access (`academic-access.service.spec.ts`)
- Smoke (`smoke.spec.ts`)

#### 3.6.2 Pruebas de caja negra (manuales — entorno AWS)

Pruebas desde la interfaz de usuario sin conocer la implementación interna:

| ID | Caso de prueba | Rol / Entorno | Resultado |
|----|----------------|---------------|-----------|
| BN-01 | Login con credenciales válidas | Todos — Local + Vercel | ✅ OK |
| BN-02 | Login con credenciales inválidas muestra error | Local | ✅ OK |
| BN-03 | Usuario sin permiso no accede a módulo restringido | APODERADO → /app/risk — Local | ✅ OK |
| BN-04 | Visualizar muro y comentarios | APODERADO — Local + AWS | ✅ OK |
| BN-05 | Visualizar notas del estudiante vinculado | APODERADO — Local + AWS | ✅ OK |
| BN-06 | Acceder a "Mensajes del curso" | APODERADO — Local + Vercel | ✅ OK |
| BN-07 | Enviar mensaje en chat existente | APODERADO — Local | ✅ OK |
| BN-08 | Ver salas de chat | PROFESOR — Local + AWS | ✅ OK |
| BN-09 | Registrar / ver asistencia | PROFESOR — Local + AWS | ✅ OK |
| BN-10 | Crear anotación de estudiante | PROFESOR — Local | ✅ OK |
| BN-11 | Ver reporte de riesgo académico | COLEGIO — Local + Vercel | ✅ OK |
| BN-11b | Alertas de riesgo docente | PROFESOR — Local + Vercel | ✅ OK |
| BN-12 | Listar usuarios del sistema | ADMIN — Local + AWS | ✅ OK |
| BN-13 | Endpoint /api/health responde status OK | AWS + Vercel proxy | ✅ OK |

**Resumen matriz:** **17** casos ejecutados de **17** planificados (incluye flujos gris documentados en matriz). Evidencia: `7_Matriz_pruebas_negras.png`.

#### 3.6.3 Pruebas de caja gris (integración)

Pruebas de flujos que cruzan frontend, API y base de datos:

| ID | Flujo integrado | Resultado |
|----|-----------------|-----------|
| BG-01 | Login → JWT válido → dashboard según rol | ✅ OK (Local) |
| BG-02 | Profesor → chat con sala visible | ✅ OK (Local) |
| BG-03 | Registro notas + asistencia → reporte riesgo detecta estudiantes | ✅ OK (Local + Vercel) |
| BG-04 | Frontend nube consume API EB sin errores CORS | ✅ OK (Vercel + proxy middleware) |
| BG-05 | Publicación en muro → comentario → visible para apoderado | ✅ OK (Local + AWS) |

#### 3.6.4 Validaciones técnicas de build

| Validación | Comando | Resultado |
|------------|---------|-----------|
| Build backend | `npm run build` | ✅ OK |
| Tests backend | `npm test` | ✅ OK — 56 tests |
| Cobertura backend | `npm run test:coverage` | ✅ OK — ver métricas 3.6.1 |
| Build frontend Vercel | `npm run build:vercel` | ✅ OK |
| Health AWS | GET `/api/health` | ✅ OK — status UP |
| Frontend Vercel accesible | Navegador | ✅ OK — https://aulafy-web.vercel.app |
| Frontend AWS S3 | Navegador | ✅ OK — build staging Semana 7 (chat, riesgo, login) |

### 3.7 Documentos y archivos actualizados

Documentos actualizados o creados desde la primera experiencia y en el marco de Semana 7:

#### Documentación académica (`docs/`)

| Documento | Semana | Descripción |
|-----------|--------|-------------|
| `Desarrollo_proyecto_grupo8_semana_3.docx` | 3 | Planificación y planes complementarios |
| `Desarrollo_proyecto_grupo8_semana4.docx` | 4 | Diseño técnico |
| `semana-4/modelo-datos/` | 4 | Schema SQL, seed, diagrama ER |
| `semana-4/diseno-producto/mockups/` | 4 | Mockups por rol |
| `semana-4/diseno-producto/navegacion/` | 4 | Mapa de navegación |
| `semana-5/EXP2_S5_Desarrollo_proyecto_grupo8_semana5.docx` | 5 | Desarrollo y despliegue AWS |
| `semana-5/evidencias/` | 5 | Capturas de despliegue |
| `semana-6/TSY2201_EXP2_S6_Formato_respuesta_Aulafy_Semana6.docx` | 6 | Continuando el desarrollo |
| `semana-6/evidencias/` | 6 | Capturas de validación técnica |
| `semana-7/TSY2201_EXP2_S7_Documento_Presentacion.md` | 7 | **Este documento (fuente DOCX)** |
| `semana-7/PLAN_TRABAJO_SEMANA7.md` | 7 | Plan de trabajo interno |
| `semana-7/evidencias/` | 7 | Evidencias de cierre MVP |

#### Código y configuración

| Archivo | Descripción |
|---------|-------------|
| `README.md` | Documentación principal del proyecto |
| `backend/aulafy-api-nest/README.md` | Documentación del API |
| `database/mysql/schema.sql` | Esquema oficial MySQL |
| `database/mysql/seed.sql` | Datos demo |
| `database/mysql/migrations/` | Migraciones incrementales para RDS |
| `.github/workflows/` | CI/CD GitHub Actions |
| `sonar-project.properties` | Configuración SonarQube/SonarCloud |
| `.env.example` | Variables de entorno con placeholders seguros |
| `deploy-aws.sh` | Script de despliegue AWS |
| `scripts/aws/` | Scripts CloudFront, Budget, SSM |

### 3.8 Cuentas demo para revisión

Datos de demostración exclusivamente para revisión académica:

| Rol | Email | Contraseña |
|-----|-------|------------|
| ADMIN | admin@aulafy.cl | Admin1234 |
| COLEGIO | colegio@aulafy.cl | Colegio1234 |
| PROFESOR | profesor@aulafy.cl | Profesor1234 |
| APODERADO | apoderado@aulafy.cl | Apoderado1234 |
| ESTUDIANTE | estudiante@aulafy.cl | Estudiante1234 |

**Flujos sugeridos para revisión:**

1. **Apoderado:** login → Muro → Notas → Asistencia → **Mensajes del curso**.
2. **Profesor:** login → Chat (crear sala) → Asistencia → Anotaciones.
3. **Colegio:** login → **Reportes de riesgo académico** → Calendario.
4. **Admin:** login → Usuarios → Cursos → Reportes.

### 3.9 Limitaciones conocidas y mejoras futuras

1. **Chat:** sin mensajería en tiempo real (WebSocket). Recarga manual necesaria.
2. **Profesor jefe:** `role_in_course` persistido; permisos parciales en anotaciones/calendario; resto de módulos sin diferenciación fina.
3. **Riesgo académico:** umbrales fijos en código (4.0 y 85%), no configurables en UI.
4. **Frontend:** cursos y usuarios en modo solo lectura (backend sí expone CRUD).
5. **Logout:** limpieza local; JWT válido en servidor hasta expiración (2h).
6. **Telegram:** opcional; sin credenciales opera en modo `NOT_CONFIGURED`.
7. **Dashboards:** navegación por módulos, sin KPIs de negocio avanzados.
8. **AWS staging:** HTTP en S3, sin HTTPS/CloudFront activo.

**Roadmap post-MVP:**

- WebSocket para chat en tiempo real.
- Permisos granulares por `role_in_course`.
- CloudFront + HTTPS + AWS Budget + SSM Parameter Store.
- Ampliar cobertura de pruebas automatizadas.
- RDS con acceso privado desde backend.

### 3.10 Evidencias

Capturas de pantalla en `docs/semana-7/evidencias/`:

| # | Archivo | Descripción | Estado |
|---|---------|-------------|--------|
| 1 | `1_GitHub_rama_semana7_new.png` | Repositorio y rama Semana 7 | ⏳ Tras push a GitHub |
| 2 | `2_Frontend_Vercel_login.png` / `2_Frontend_AWS_login.png` | Login en nube | ✅ |
| 3 | `3_Chat_apoderado_funcionando.png` / `vercel/7_Vercel_apoderado_chat_funcionando.png` | Chat apoderado | ✅ |
| 4 | `4_Riesgo_academico_colegio.png` / `vercel/6_Vercel_colegio_riesgo_academico.png` | Reporte de riesgo | ✅ |
| 5 | `5_Backend_AWS_health.png` / `vercel/1_Vercel_proxy_health_Beanstalk.png` | Health check backend | ✅ |
| 6 | `6_Cobertura_tests_backend.png` | Cobertura Jest | ✅ |
| 7 | `7_Matriz_pruebas_negras.png` | Resultados pruebas manuales | ✅ |
| 8 | `8_Build_frontend_OK.png` | Build frontend exitoso | ✅ |

---

## Anexo A — Cambios de código pendientes (referencia interna)

Esta sección resume las modificaciones técnicas que el equipo debe completar antes de cerrar la entrega. Detalle completo en `PLAN_TRABAJO_SEMANA7.md`.

| Prioridad | Tarea | Tipo |
|-----------|-------|------|
| Alta | ~~Redeploy AWS con versión actual de `develop`~~ | Infra — ✅ hecho (cuenta Briceño, jul 2026) |
| Alta | ~~Aplicar migraciones RDS si BD es anterior~~ | Infra — ✅ schema+seed+migración 20260705 |
| Alta | ~~Ejecutar y documentar pruebas (blanca/negra/gris)~~ | QA — ✅ 56 tests + 17 casos manuales |
| Alta | ~~Completar marcadores `[PENDIENTE]` en este documento~~ | Doc — ✅ |
| Media | Actualizar `backend/aulafy-api-nest/README.md` (chat en MVP) | Doc |
| Media | Agregar sección Semana 7 en `README.md` raíz | Doc |
| Media | Crear `database/mysql/README.md` (guía migraciones) | Doc |
| Baja | Ampliar tests backend (notifications, feed, attendance) | Código |
| Baja | Agregar `test:coverage` al CI | CI |

---

## Anexo B — Conversión a DOCX

Para generar el documento oficial:

1. Completar todos los marcadores `[PENDIENTE]`.
2. Copiar el contenido a la plantilla `TSY2201_EXP2_S7_Formato_respuesta_Finalizando el desarrollo de la solución.docx`.
3. Insertar capturas de `docs/semana-7/evidencias/`.
4. Guardar como `docs/semana-7/TSY2201_EXP2_S7_Formato_respuesta_Aulafy_Semana7.docx`.
5. Subir al repositorio y entregar en plataforma Duoc UC.

---

*Documento generado como borrador de trabajo — Semana 7 · Aulafy · Julio 2026*
