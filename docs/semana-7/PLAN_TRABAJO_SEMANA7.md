# Plan de trabajo — Semana 7 · Finalizando el desarrollo de la solución

**Proyecto:** Aulafy  
**Rama de trabajo:** `feature/semana-7-documentacion-cierre`  
**Base:** `develop` @ `2b25730`  
**Fecha de inicio:** 1 de julio de 2026  
**Integrantes:** Katherine Valenzuela · Sebastián Briceño  
**Profesor:** Alonso Esteban Castillo Pizarro

---

## Objetivo de la semana

Cerrar el MVP de Aulafy con revisión exhaustiva, pruebas finales documentadas (caja blanca, negra y gris), despliegue AWS actualizado y entrega formal en formato académico.

**Documento fuente para DOCX:** `TSY2201_EXP2_S7_Documento_Presentacion.md`

---

## Estado general

| Área | Avance estimado | Prioridad |
|------|-----------------|-----------|
| Funcionalidades MVP | ~90% | — |
| Documento de presentación (MD) | En elaboración | Alta |
| Pruebas caja blanca (automáticas) | Parcial (27 tests backend) | Alta |
| Pruebas caja negra (manuales AWS) | Pendiente evidencia | Alta |
| Pruebas caja gris (integración) | Pendiente evidencia | Alta |
| Redeploy AWS con código actual | Pendiente | Alta |
| Migraciones RDS en staging | Por verificar | Alta |
| Evidencias capturas / video | Pendiente | Media |

---

## Fase 1 — Código e integración

### 1.1 Sin cambios funcionales obligatorios

El código en `develop` ya incorpora el cierre del MVP acordado con el profesor (merge `feature/semana-8-cierre-mvp-chat-profesor-jefe`):

- Chat incluido en MVP (`/app/chat` para PROFESOR, APODERADO, ESTUDIANTE).
- `role_in_course` en `course_teachers` (HEAD_TEACHER, SUBJECT_TEACHER, ASSISTANT).
- Módulo de riesgo académico operativo (`/app/risk` para ADMIN y COLEGIO).
- Navegación del apoderado con "Mensajes del curso".

### 1.2 Ajustes de código recomendados (priorizados)

| ID | Tarea | Archivo(s) | Tipo | Estado |
|----|-------|------------|------|--------|
| C-01 | Alinear README backend: chat ya no es experimental | `backend/aulafy-api-nest/README.md` | Doc en código | Pendiente |
| C-02 | Documentar endpoints completos del módulo chat | `backend/aulafy-api-nest/README.md` | Doc en código | Pendiente |
| C-03 | Agregar sección "Entrega Semana 7" | `README.md` (raíz) | Doc en código | Pendiente |
| C-04 | Crear `database/mysql/README.md` con orden de migraciones RDS | `database/mysql/README.md` | Doc en código | Pendiente |
| C-05 | Ejecutar `npm test` + `npm run test:coverage` y registrar métricas actuales | `backend/aulafy-api-nest/` | Validación | Pendiente |
| C-06 | Corregir bugs encontrados en pruebas finales | Según hallazgos | Bugfix | Pendiente |
| C-07 | (Opcional) Agregar `test:coverage` al CI backend | `.github/workflows/backend-nest-ci.yml` | CI | Opcional |
| C-08 | (Opcional) Tests adicionales: `notifications`, `feed`, `attendance` | `backend/aulafy-api-nest/test/` | Calidad | Opcional |

### 1.3 Migraciones RDS (entorno AWS existente)

Si la base de datos en RDS **no** fue recreada desde cero, ejecutar en orden:

```
database/mysql/migrations/20260531_chat_bridge.sql
database/mysql/migrations/20260626_add_role_in_course_to_course_teachers.sql
database/mysql/migrations/20260627_seed_risk_demo_students.sql
```

Verificar post-migración:

- Tablas `chat_rooms`, `chat_messages` existen.
- Columna `role_in_course` en `course_teachers`.
- Estudiantes demo Ana Gómez y Carlos Pérez con datos de riesgo.

### 1.4 Redeploy AWS

| Componente | Método | Workflow / script |
|------------|--------|-------------------|
| Frontend | Manual CI | `.github/workflows/frontend-aws-s3-deploy.yml` |
| Backend | Manual CI o EB | `.github/workflows/backend-aws-ecs-deploy.yml` o `deploy-aws.sh` |
| Verificación | HTTP | `/api/health`, login por rol, chat apoderado, riesgo colegio |

**Nota:** El README documenta Elastic Beanstalk como entorno activo. Los workflows nuevos apuntan a ECS. Unificar en documentación cuál es el entorno de revisión académica vigente.

---

## Fase 2 — Documentación

### 2.1 Documentos a crear o actualizar

| ID | Documento | Ubicación | Estado |
|----|-----------|-----------|--------|
| D-01 | Documento de presentación Semana 7 (MD) | `docs/semana-7/TSY2201_EXP2_S7_Documento_Presentacion.md` | En progreso |
| D-02 | Plan de trabajo interno | `docs/semana-7/PLAN_TRABAJO_SEMANA7.md` | En progreso |
| D-03 | Índice de evidencias requeridas | `docs/semana-7/evidencias/README.md` | Pendiente |
| D-04 | Documento oficial DOCX (desde MD) | `docs/semana-7/TSY2201_EXP2_S7_Formato_respuesta_Aulafy_Semana7.docx` | Pendiente |
| D-05 | README raíz — sección Semana 7 | `README.md` | Pendiente |
| D-06 | README backend alineado | `backend/aulafy-api-nest/README.md` | Pendiente |
| D-07 | Guía migraciones RDS | `database/mysql/README.md` | Pendiente |

### 2.2 Respuestas formales al profesor (incorporar en presentación)

| Pregunta del profesor | Respuesta acordada |
|-----------------------|-------------------|
| ¿Chat dentro o fuera del MVP? | **Dentro del MVP** (Opción B). Limitación: sin WebSocket; recarga manual. |
| ¿Profesor jefe implementado? | Campo `role_in_course` en BD. Permisos diferenciados = mejora futura. |
| ¿Qué es el módulo risk? | Riesgo **académico**: promedio < 4.0 o asistencia < 85%. Solo ADMIN/COLEGIO. |
| ¿Casos de prueba ejecutados? | **[PENDIENTE]** Registrar X/Y de la matriz del Plan de Pruebas. |

---

## Fase 3 — Pruebas y calidad

### 3.1 Caja blanca (automáticas)

```bash
cd backend/aulafy-api-nest
npm install
npm run build
npm test
npm run test:coverage
```

**Suites actuales (8 archivos spec):**

- `test/auth/auth.service.spec.ts`
- `test/courses/courses.service.spec.ts`
- `test/chat/chat.service.spec.ts`
- `test/annotations/annotations.service.spec.ts`
- `test/risk/risk.service.spec.ts`
- `test/risk/risk-permissions.spec.ts`
- `test/access/academic-access.service.spec.ts`
- `test/smoke.spec.ts`

**Registrar en documento:** número de tests, % cobertura (statements, branches, functions, lines).

### 3.2 Caja negra (manuales en AWS)

Ejecutar con cuentas demo en el entorno desplegado:

| ID | Caso | Rol | Resultado |
|----|------|-----|-----------|
| BN-01 | Login exitoso | Todos | [ ] |
| BN-02 | Acceso denegado a módulo de otro rol | Todos | [ ] |
| BN-03 | Visualizar muro y comentarios | APODERADO | [ ] |
| BN-04 | Ver notas del estudiante vinculado | APODERADO | [ ] |
| BN-05 | Acceder a Mensajes del curso | APODERADO | [ ] |
| BN-06 | Enviar mensaje en chat | APODERADO | [ ] |
| BN-07 | Crear sala de chat | PROFESOR | [ ] |
| BN-08 | Registrar asistencia | PROFESOR | [ ] |
| BN-09 | Crear anotación | PROFESOR | [ ] |
| BN-10 | Ver reporte de riesgo académico | COLEGIO | [ ] |
| BN-11 | Gestionar usuarios (solo lectura UI) | ADMIN | [ ] |
| BN-12 | Health backend responde OK | — | [ ] |

### 3.3 Caja gris (integración)

| ID | Flujo integrado | Componentes | Resultado |
|----|-----------------|-------------|-----------|
| BG-01 | Login → JWT → dashboard → módulo académico | Frontend + API + BD | [ ] |
| BG-02 | Profesor crea chat → Apoderado responde | Chat API + permisos + seed | [ ] |
| BG-03 | Notas + asistencia → cálculo riesgo | Academic + Risk services | [ ] |
| BG-04 | CORS frontend AWS → backend EB | S3 + EB + Helmet/CORS | [ ] |
| BG-05 | Logout cliente → token expira en servidor | Auth JWT | [ ] |

---

## Fase 4 — Evidencias

Capturas requeridas en `docs/semana-7/evidencias/`:

| # | Archivo sugerido | Contenido |
|---|------------------|-----------|
| 1 | `1_GitHub_rama_semana7_documentacion_cierre.png` | Repositorio y rama `feature/semana-7-documentacion-cierre` |
| 2 | `2_Frontend_AWS_login.png` | Pantalla login en AWS |
| 3 | `3_Chat_apoderado_funcionando.png` | Chat accesible para apoderado |
| 4 | `4_Riesgo_academico_colegio.png` | Reporte con estudiantes en riesgo |
| 5 | `5_Backend_AWS_health.png` | Endpoint /api/health |
| 6 | `6_Cobertura_tests_backend.png` | Resultado test:coverage |
| 7 | `7_Matriz_pruebas_negras.png` | Matriz con resultados |
| 8 | `8_Build_frontend_OK.png` | npm run build:staging |

Video funcional (opcional pero recomendado): flujo login multirol + chat + riesgo.

---

## Fase 5 — Entrega

### Checklist final

- [ ] Rama `feature/semana-7-documentacion-cierre` mergeada a `develop`
- [ ] AWS redesplegado con última versión
- [ ] Migraciones RDS aplicadas (si aplica)
- [ ] Pruebas ejecutadas y documentadas
- [ ] MD convertido a DOCX oficial
- [ ] DOCX y evidencias subidos a `docs/semana-7/`
- [ ] README actualizado
- [ ] Entrega en plataforma Duoc UC

### Orden de ejecución recomendado

```
1. Verificar / aplicar migraciones RDS
2. Redeploy backend + frontend AWS
3. Ejecutar pruebas caja blanca (local)
4. Ejecutar pruebas caja negra/gris (AWS)
5. Corregir bugs encontrados
6. Completar métricas en documento MD
7. Tomar evidencias
8. Actualizar README y docs backend
9. Convertir MD → DOCX
10. Commit, push y entrega
```

---

## Commits sugeridos en esta rama

```
docs(semana-7): agregar documento de presentacion y plan de trabajo
docs(semana-7): agregar indice de evidencias requeridas
docs: alinear README backend con alcance MVP chat
docs: agregar guia de migraciones RDS
docs: agregar seccion Entrega Semana 7 en README
docs(semana-7): agregar evidencias y documento oficial DOCX
```
