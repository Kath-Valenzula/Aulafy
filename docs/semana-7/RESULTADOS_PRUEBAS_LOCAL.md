# Resultados de pruebas locales — Semana 7

**Fecha:** 3 de julio de 2026  
**Entorno:** local (Docker MySQL + NestJS :8080 + Angular :4200)  
**Rama:** `feature/semana-7-documentacion-cierre`  
**Evidencias:** `docs/semana-7/evidencias/` (25 capturas PNG)

---

## Bug corregido durante pruebas

Durante las pruebas automatizadas se detectó que los módulos **chat**, **riesgo** y **usuarios** quedaban en estado "Cargando..." porque Angular no refrescaba la UI tras respuestas HTTP. Se corrigió agregando `ChangeDetectorRef.markForCheck()` en:

- `frontend/aulafy-web/src/app/features/risk/risk.ts`
- `frontend/aulafy-web/src/app/features/chat/chat.ts`
- `frontend/aulafy-web/src/app/features/users/users.ts`

---

## Resumen ejecutivo

| Tipo | Ejecutados | Aprobados | Evidencia |
|------|------------|-----------|-----------|
| Caja blanca (automáticas) | 31 tests | 31 | `6_Cobertura_tests_backend.png` |
| Caja negra (UI) | 12 casos | 12 | `BN-*.png` |
| Caja gris (integración UI) | 3 flujos | 3 | `BG-*.png` |
| **Total** | **46** | **46** | 25 capturas |

---

## Fase 1 — Caja blanca

```bash
cd backend/aulafy-api-nest && npm test && npm run test:coverage
```

| Métrica | Resultado |
|---------|-----------|
| Test Suites | 8 passed |
| Tests | **31 passed** |
| Statements | 62.87% |
| Branches | 39.49% |
| Functions | 50.51% |
| Lines | 61.35% |

Captura: `evidencias/6_Cobertura_tests_backend.png`

---

## Fase 2 — Caja negra (navegador)

| ID | Caso | Rol | Resultado | Captura |
|----|------|-----|-----------|---------|
| BN-01 | Login exitoso | ADMIN | OK | `BN-01_admin_dashboard.png` |
| BN-01 | Login exitoso | COLEGIO | OK | `BN-01_colegio_dashboard.png` |
| BN-01 | Login exitoso | PROFESOR | OK | `BN-01_profesor_dashboard.png` |
| BN-01 | Login exitoso | APODERADO | OK | `BN-01_apoderado_dashboard.png` |
| BN-01 | Login exitoso | ESTUDIANTE | OK | `BN-01_estudiante_dashboard.png` |
| BN-02 | Credenciales inválidas | — | OK | `BN-02_login_credenciales_invalidas.png` |
| BN-02 | Acceso denegado `/app/risk` | APODERADO | OK | `BN-02_apoderado_acceso_denegado_risk.png` |
| BN-03 | Visualizar muro | APODERADO | OK | `BN-03_apoderado_muro.png` |
| BN-04 | Ver notas vinculadas | APODERADO | OK | `BN-04_apoderado_notas.png` |
| BN-04 | Ver notas propias | ESTUDIANTE | OK | `BN-04_estudiante_notas.png` |
| BN-05 | Acceder a chat | APODERADO | OK | `BN-05_apoderado_chat.png` |
| BN-05 | Acceder a chat | ESTUDIANTE | OK | `BN-05_estudiante_chat.png` |
| BN-06 | Enviar mensaje en chat | APODERADO | OK | `BN-06_apoderado_enviar_mensaje.png` |
| BN-07 | Ver salas de chat | PROFESOR | OK | `BN-07_profesor_chat.png` |
| BN-08 | Módulo asistencia | PROFESOR | OK | `BN-08_profesor_asistencia.png` |
| BN-09 | Módulo anotaciones | PROFESOR | OK | `BN-09_profesor_anotaciones.png` |
| BN-10 | Reporte riesgo académico | COLEGIO | OK | `BN-10_colegio_riesgo_academico.png` |
| BN-10 | Reporte riesgo académico | ADMIN | OK | `BN-10_admin_riesgo_academico.png` |
| BN-11 | Gestión usuarios (UI) | ADMIN | OK | `BN-11_admin_usuarios.png` |
| BN-12 | Health backend | — | OK | `BN-12_health_backend.png` |

Pantalla login: `BN-01_login_pantalla.png`

---

## Fase 3 — Caja gris (integración)

| ID | Flujo | Resultado | Captura |
|----|-------|-----------|---------|
| BG-01 | Login apoderado → módulo académico | OK | `BG-01_apoderado_login_modulo_academico.png` |
| BG-02 | Profesor → chat con sala visible | OK | `BG-02_profesor_chat_sala.png` |
| BG-03 | Colegio → riesgo con 2 estudiantes demo | OK | `BG-03_colegio_riesgo_calculado.png` |

**Estudiantes en riesgo detectados:**
- Ana Gómez — riesgo académico (promedio bajo)
- Carlos Pérez — riesgo por asistencia (50%)

---

## Nuevos cambios verificados

| Cambio | Verificación | Estado |
|--------|--------------|--------|
| Chat en MVP | UI apoderado/profesor/estudiante | OK |
| `role_in_course` | BD `HEAD_TEACHER` en seed | OK |
| Riesgo académico | UI colegio + API | OK |
| Navegación apoderado "Mensajes del curso" | UI + captura | OK |

---

## Reproducir pruebas

```bash
# Entorno
docker compose up -d
source ~/.nvm/nvm.sh && nvm use 22
cd backend/aulafy-api-nest && npm run start:dev
cd frontend/aulafy-web && npx ng serve --proxy-config proxy.conf.json

# Capturas automáticas
node scripts/semana-7-browser-tests.mjs
```

---

## Pendiente para entrega final

- [x] Captura GitHub rama Semana 7 (`1_GitHub_rama_semana7_documentacion_cierre.png`)
- [x] Pruebas caja negra/gris en **AWS** (capturas en `evidencias/aws/`)
- [x] **Frontend Vercel** con fix UI — https://aulafy-web.vercel.app (capturas en `evidencias/vercel/`)
- [x] Matriz pruebas negras (`7_Matriz_pruebas_negras.png`) y build frontend (`8_Build_frontend_OK.png`)
- [x] Documento MD completado y DOCX generado
- [ ] **Redeploy frontend AWS S3** (opcional — bloqueado por credenciales GitHub Actions)
- [ ] Merge `feature/semana-7-documentacion-cierre` → `develop`
- [ ] Subir DOCX a plataforma Duoc UC

---

## Pruebas AWS — 3 de julio de 2026

**Frontend:** http://aulafy-frontend-803615173905.s3-website.us-east-2.amazonaws.com  
**Backend health:** http://aulafy-api-staging.eba-uuqbidym.us-east-2.elasticbeanstalk.com/api/health

| Prueba | Resultado AWS | Captura |
|--------|---------------|---------|
| Login pantalla | OK | `aws/2_Frontend_AWS_login.png` |
| Login admin/colegio/profesor/apoderado/estudiante | OK | `aws/AWS_BN-01_*_dashboard.png` |
| Health backend | OK — status UP, production | `aws/5_Backend_AWS_health.png` |
| Admin usuarios | OK | `aws/AWS_BN-11_admin_usuarios.png` |
| Muro / notas apoderado | OK | `aws/AWS_BN-03_*`, `AWS_BN-04_*` |
| Asistencia profesor | OK | `aws/AWS_BN-08_profesor_asistencia.png` |
| Chat apoderado/profesor | Parcial — UI en "Cargando conversaciones..." (frontend AWS sin redeploy) | `aws/3_Chat_apoderado_funcionando_AWS.png` |
| Riesgo académico colegio | Parcial — UI en "Cargando reporte..." (frontend AWS sin redeploy) | `aws/4_Riesgo_academico_colegio_AWS.png` |

**Nota:** El backend responde correctamente en AWS (health OK, API operativa). El frontend desplegado en S3 corresponde a una versión anterior sin el fix de `ChangeDetectorRef`. Tras publicar el build actual, chat y riesgo deberían mostrar datos como en local.

### Intento de redeploy (3-jul-2026)

1. Commit y push del fix: rama `feature/semana-7-documentacion-cierre`
2. Workflow disparado: https://github.com/Kath-Valenzula/Aulafy/actions/runs/28694005575
3. **Resultado: falló** en `Configure AWS credentials` — el repositorio no tiene variables en el environment `staging`:
   - `AWS_REGION` (vacío)
   - `AWS_ROLE_TO_ASSUME` (vacío)
   - `AWS_S3_BUCKET_STAGING` (vacío)

**Para completar el redeploy**, Katherine (dueña del repo / cuenta AWS) debe elegir una opción:

**Opción A — GitHub Actions (recomendada):** Configurar en GitHub → Settings → Environments → staging:
```
AWS_REGION=us-east-2
AWS_S3_BUCKET_STAGING=aulafy-frontend-803615173905
AWS_ROLE_TO_ASSUME=<ARN del rol IAM OIDC>
```
Luego ejecutar manualmente **Frontend AWS S3 Deploy Manual** sobre la rama `feature/semana-7-documentacion-cierre` o `develop` (tras merge).

**Opción B — Script local:** Con AWS CLI configurado:
```bash
bash scripts/aws/deploy-frontend-s3.sh
```

**GitHub:** `1_GitHub_rama_semana7_documentacion_cierre.png` — rama `feature/semana-7-documentacion-cierre`, repositorio Kath-Valenzula/Aulafy.
