# Evidencias — Semana 7 (pruebas locales)

**Fecha:** 3 de julio de 2026  
**Entorno:** local — http://localhost:4200 + http://localhost:8080/api  
**Total capturas:** 25 archivos PNG

---

## Índice por tipo de prueba

### Caja blanca
| Archivo | Descripción |
|---------|-------------|
| `6_Cobertura_tests_backend.png` | Resultado `npm run test:coverage` — 10 suites, 56 tests |

### Caja negra (BN)
| ID | Archivo | Resultado |
|----|---------|-----------|
| BN-01 | `BN-01_login_pantalla.png` | OK |
| BN-01 | `BN-01_admin_dashboard.png` | OK |
| BN-01 | `BN-01_colegio_dashboard.png` | OK |
| BN-01 | `BN-01_profesor_dashboard.png` | OK |
| BN-01 | `BN-01_apoderado_dashboard.png` | OK |
| BN-01 | `BN-01_estudiante_dashboard.png` | OK |
| BN-02 | `BN-02_login_credenciales_invalidas.png` | OK — error en login |
| BN-02 | `BN-02_apoderado_acceso_denegado_risk.png` | OK — redirección sin acceso a riesgo |
| BN-03 | `BN-03_apoderado_muro.png` | OK |
| BN-04 | `BN-04_apoderado_notas.png` | OK |
| BN-04 | `BN-04_estudiante_notas.png` | OK |
| BN-05 | `BN-05_apoderado_chat.png` | OK |
| BN-05 | `BN-05_estudiante_chat.png` | OK |
| BN-06 | `BN-06_apoderado_enviar_mensaje.png` | OK |
| BN-07 | `BN-07_profesor_chat.png` | OK |
| BN-08 | `BN-08_profesor_asistencia.png` | OK |
| BN-09 | `BN-09_profesor_anotaciones.png` | OK |
| BN-10 | `BN-10_colegio_riesgo_academico.png` | OK — 2 estudiantes en riesgo |
| BN-10 | `BN-10_admin_riesgo_academico.png` | OK |
| BN-11 | `BN-11_admin_usuarios.png` | OK — solo lectura UI |
| BN-12 | `BN-12_health_backend.png` | OK — status UP |

### Caja gris (BG)
| ID | Archivo | Resultado |
|----|---------|-----------|
| BG-01 | `BG-01_apoderado_login_modulo_academico.png` | OK |
| BG-02 | `BG-02_profesor_chat_sala.png` | OK |
| BG-03 | `BG-03_colegio_riesgo_calculado.png` | OK — Ana Gómez + Carlos Pérez |

### Alias numerados (entrega)

| # | Archivo local | Archivo AWS |
|---|---------------|-------------|
| 1 | `1_GitHub_rama_semana7_new.png` | Repositorio y rama `semana-7-new` |
| 2 | `2_Frontend_local_login.png` | `../2_Frontend_AWS_login.png` |
| 3 | `3_Chat_apoderado_funcionando.png` | `../3_Chat_apoderado_funcionando_AWS.png` |
| 4 | `4_Riesgo_academico_colegio.png` | `../4_Riesgo_academico_colegio_AWS.png` |
| 5 | `5_Backend_local_health.png` | `../5_Backend_AWS_health.png` |
| 6 | `../6_Cobertura_tests_backend.png` | — |

### Carpeta AWS (`evidencias/aws/`)

20 capturas adicionales con prefijo `AWS_BN-*` y `AWS_BG-*`.

Script: `node scripts/semana-7-browser-tests-aws.mjs`

### Carpeta Vercel (`evidencias/vercel/`)

Frontend en **https://aulafy-web.vercel.app** conectado al backend Elastic Beanstalk vía proxy `/api` (middleware Vercel).

| Archivo | Descripción |
|---------|-------------|
| `1_Vercel_proxy_health_Beanstalk.png` | `/api/health` en Vercel → respuesta del backend AWS (`status: UP`) |
| `2_Frontend_Vercel_login.png` | Pantalla de login en dominio Vercel |
| `3_Vercel_admin_dashboard.png` | Dashboard administrativo |
| `4_Vercel_admin_chat_funcionando.png` | Chat cargando mensajes (fix Angular 21) |
| `5_Vercel_admin_riesgo_academico.png` | Reporte de riesgo académico admin |
| `6_Vercel_colegio_riesgo_academico.png` | Riesgo académico rol COLEGIO |
| `9_Vercel_profesor_riesgo_academico.png` | Riesgo académico rol PROFESOR |
| `10_Vercel_apoderado_dashboard_mensajes.png` | Dashboard apoderado — Mensajes del curso |
| `7_Vercel_apoderado_chat_funcionando.png` | Chat apoderado |

Script: `node scripts/semana-7-browser-tests-vercel.mjs`

## Script de reproducción

```bash
source ~/.nvm/nvm.sh && nvm use 22
node scripts/semana-7-browser-tests.mjs
```

Requiere backend, frontend y MySQL levantados en local.
