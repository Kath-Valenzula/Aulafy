# Resultados de pruebas — Semana 7 (rama `semana-7-new`)

**Fecha:** 5 de julio de 2026  
**Entorno:** local (Docker MySQL + NestJS :8080 + Angular :4200) y Vercel + AWS  
**Rama:** `semana-7-new` (integración develop + documentación Semana 7)  
**Evidencias:** `docs/semana-7/evidencias/`

---

## Resumen ejecutivo

| Tipo | Ejecutados | Aprobados | Evidencia |
|------|------------|-----------|-----------|
| Caja blanca (automáticas) | 56 tests | 56 | `6_Cobertura_tests_backend.png` |
| Caja negra (UI) | 17 casos | 17 | `BN-*.png`, matriz |
| Caja gris (integración UI) | 4 flujos | 4 | `BG-*.png` |
| **Total documentado** | **77** | **77** | 65+ capturas |

---

## Fase 1 — Caja blanca

```bash
cd backend/aulafy-api-nest && npm test && npm run test:coverage
```

| Métrica | Resultado |
|---------|-----------|
| Test Suites | 10 passed |
| Tests | **56 passed** |
| Statements | 64.87% |
| Branches | 43.52% |
| Functions | 52.21% |
| Lines | 63.90% |

**Suites nuevas (integración Kath):** permisos por `role_in_course` en anotaciones y calendario.

---

## Fase 2 — Caja negra (destacados)

| ID | Caso | Resultado |
|----|------|-----------|
| BN-01 | Login exitoso (5 roles) | OK |
| BN-05/06 | Chat apoderado | OK |
| BN-07 | Chat profesor | OK |
| BN-10 | Riesgo académico COLEGIO/ADMIN | OK |
| BN-10b | Alertas riesgo PROFESOR | OK |
| BN-11 | Usuarios admin | OK |
| BN-12 | Health backend | OK |

Matriz completa: `7_Matriz_pruebas_negras.png`

---

## Fase 3 — Caja gris

| ID | Flujo | Resultado |
|----|-------|-----------|
| BG-01 | Login → JWT → módulo académico | OK |
| BG-02 | Profesor → chat visible | OK |
| BG-03 | Notas + asistencia → riesgo | OK |
| BG-04 | Vercel → API Beanstalk (proxy) | OK |

---

## Cambios integrados (Kath + Sebastián)

| Cambio | Estado |
|--------|--------|
| Chat en MVP | OK |
| `role_in_course` en BD + permisos parciales anotaciones/calendario | OK |
| Riesgo académico ADMIN/COLEGIO/PROFESOR | OK |
| Dashboard apoderado con tarjeta Mensajes del curso | OK |
| Fix UI Angular 21 (`ChangeDetectorRef`) | OK |
| Vercel + proxy Beanstalk | OK |
| Workflow deploy backend EB | OK (en repo) |
| Redeploy AWS S3 + EB (cuenta Briceño) | OK — jul 2026 |
| Evidencias AWS actualizadas | OK — `evidencias/aws/` |

---

## Pendiente para entrega final

- [ ] **Push** rama `semana-7-new` a GitHub (incluye scripts AWS + evidencias nuevas)
- [ ] Captura GitHub post-push (`1_GitHub_rama_semana7_new.png`) — script: `node scripts/semana-7-github-screenshot.mjs`
- [ ] **Merge** `semana-7-new` → `develop` en GitHub (coordinar con Kath)
- [ ] Regenerar DOCX tras push (`python3 scripts/generate-docx-semana7.py`)
- [ ] **Subir DOCX** a plataforma Duoc UC
- [x] Redeploy frontend + backend AWS con código Semana 7
- [x] Evidencias AWS desde entorno desplegado (6 jul 2026)

---

## URLs de revisión

- **Vercel:** https://aulafy-web.vercel.app
- **Frontend AWS (Semana 7):** http://aulafy-frontend-605134438568.s3-website.us-east-2.amazonaws.com
- **Backend AWS (Semana 7):** http://aulafy-api-staging-sbriceno.eba-57zmbb7c.us-east-2.elasticbeanstalk.com/api/health
- **Backend AWS (Kath):** http://aulafy-api-staging.eba-uuqbidym.us-east-2.elasticbeanstalk.com/api/health

**Cuentas demo:** admin@aulafy.cl / Admin1234 · profesor@aulafy.cl / Profesor1234 · apoderado@aulafy.cl / Apoderado1234
