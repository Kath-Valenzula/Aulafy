# Auditoria de calidad tecnica - Semana 6

Proyecto: Aulafy  
Fecha: 26/06/2026  
Stack vigente: Angular 21, NestJS, Node.js, TypeScript, MySQL 8.x, TypeORM y AWS para revision academica.

## Objetivo

Preparar evidencia tecnica de calidad para Semana 6 sin cambiar funcionalidades de negocio, rutas de API ni arquitectura. Esta auditoria registra build, pruebas, cobertura, auditoria de dependencias, preparacion SonarQube/SonarCloud y eliminacion de dependencia obligatoria de Google Fonts.

## Backend

Ubicacion: `backend/aulafy-api-nest`

### Build

Comando ejecutado:

```bash
npm run build
```

Resultado: OK. El backend compila con `tsc -p tsconfig.build.json`.

### Pruebas Jest

Comando ejecutado:

```bash
npm test
```

Resultado: OK.

- Test suites: 7 passed / 7 total.
- Tests: 27 passed / 27 total.
- Snapshots: 0.

### Cobertura

Se agrego el script:

```json
"test:coverage": "jest --coverage --runInBand"
```

Tambien se configuro `coverageDirectory: "coverage"` en `jest.config.js`.

Comando ejecutado:

```bash
npm run test:coverage
```

Resultado: OK.

Resumen de cobertura:

| Metrica | Resultado |
| --- | ---: |
| Statements | 61.45% |
| Branches | 39.42% |
| Functions | 47.85% |
| Lines | 59.50% |

Observacion: no se definio umbral obligatorio todavia, porque esta medicion corresponde a una primera linea base. Forzar 90% en este momento bloquearia el flujo sin aportar valor inmediato al MVP.

## Frontend

Ubicacion: `frontend/aulafy-web`

### Scripts detectados

- `npm run build`
- `npm run build:staging`
- `npm start`
- `npm test`

No se encontraron archivos `*.spec.ts`, `*.test.ts`, `karma.conf.*` ni `vitest.config.*` dentro del frontend. Por lo tanto, no se agrega testing frontend en este bloque. La recomendacion es definir pruebas unitarias de componentes criticos en una iteracion posterior.

### Build

Comando ejecutado:

```bash
npm run build
```

Resultado: OK.

- Initial total: 292.83 kB raw / 80.49 kB estimated transfer.
- Output: `frontend/aulafy-web/dist/aulafy-web`.

### Google Fonts

Estado anterior:

- `src/index.html` cargaba fuentes desde `fonts.googleapis.com`:
  - Inter.
  - Material Symbols Outlined.

Cambio aplicado:

- Se eliminaron los enlaces externos a Google Fonts.
- La tipografia base queda en fuentes del sistema:
  - `system-ui`
  - `-apple-system`
  - `BlinkMacSystemFont`
  - `"Segoe UI"`
  - `sans-serif`

Resultado:

- El build Angular ya no depende de Google Fonts externos.
- No quedan referencias a `fonts.googleapis.com` ni `fonts.gstatic.com` en el frontend.

Pendiente visual:

- La clase `material-symbols-outlined` se mantiene como fallback. Para una version productiva 100% offline, conviene reemplazar los iconos de fuente por SVG locales o una libreria incluida en el bundle.
- Sigue existiendo dependencia runtime de `cdn.tailwindcss.com`; no se modifico en este bloque porque migrar Tailwind a build local requiere una tarea tecnica separada.

## npm audit

No se ejecuto `npm audit fix` ni `npm audit fix --force`.

### Backend

Comando ejecutado:

```bash
npm audit --audit-level=moderate
```

Resultado: se detectaron vulnerabilidades.

| Severidad | Cantidad |
| --- | ---: |
| Low | 0 |
| Moderate | 18 |
| High | 4 |
| Critical | 0 |
| Total | 22 |

Paquetes principales reportados:

- Directos:
  - `@nestjs/core` (high)
  - `@nestjs/platform-express` (high)
  - `@nestjs/typeorm` (high)
  - `jest` (moderate)
  - `ts-jest` (moderate)
- Transitivos:
  - `multer` (high)
  - `@jest/*`
  - `babel-jest`
  - `babel-plugin-istanbul`
  - `js-yaml`

Observacion: varios fixes propuestos implican cambios mayores o resoluciones no convenientes para aplicar automaticamente. La recomendacion es actualizar dependencias de forma controlada, validar build, tests y ejecucion local/AWS antes de subir cambios.

### Frontend

Comando ejecutado:

```bash
npm audit --audit-level=moderate
```

Resultado: se detectaron vulnerabilidades.

| Severidad | Cantidad |
| --- | ---: |
| Low | 2 |
| Moderate | 3 |
| High | 10 |
| Critical | 0 |
| Total | 15 |

Paquetes principales reportados:

- Directos:
  - `@angular/build` (high)
  - `@angular/common` (high)
  - `@angular/compiler` (moderate)
  - `@angular/compiler-cli` (moderate)
  - `@angular/core` (high)
  - `@angular/forms` (high)
  - `@angular/platform-browser` (high)
  - `@angular/router` (high)
- Transitivos:
  - `@babel/core`
  - `esbuild`
  - `hono`
  - `piscina`
  - `tar`
  - `undici`
  - `vite`

Observacion: no se aplicaron fixes automaticos para evitar cambios no controlados en Angular/build tooling.

## SonarQube / SonarCloud

Se agrego `sonar-project.properties` como configuracion inicial segura.

Incluye:

- Fuentes backend y frontend.
- Tests `*.spec.ts`.
- Exclusiones para `node_modules`, `dist`, `coverage`, `.angular`, `docs` y `database`.
- Ruta de cobertura backend:
  - `backend/aulafy-api-nest/coverage/lcov.info`

No incluye:

- Token.
- Credenciales.
- Organizacion SonarCloud inventada.

Para usarlo en CI/CD se debe configurar `SONAR_TOKEN` como GitHub Secret o variable de entorno segura.

## Recomendaciones priorizadas

1. Mantener `npm run build`, `npm test` y `npm run test:coverage` como evidencia minima de Semana 6.
2. Revisar vulnerabilidades `high` del backend asociadas a NestJS/Express/Multer en una rama separada.
3. Revisar vulnerabilidades del frontend actualizando Angular y tooling de forma controlada, sin `audit fix --force`.
4. Migrar Tailwind desde CDN a configuracion local de build para eliminar dependencia runtime externa.
5. Reemplazar Material Symbols por SVG locales o una libreria incluida en el bundle.
6. Agregar pruebas frontend para login, guards, navegacion por rol y estados vacios.
7. Activar SonarCloud/SonarQube en GitHub Actions cuando exista `SONAR_TOKEN` configurado.

## Estado final

- Backend build: OK.
- Backend tests: OK.
- Backend coverage: medido y documentado.
- Frontend build: OK.
- npm audit backend: vulnerabilidades detectadas y documentadas.
- npm audit frontend: vulnerabilidades detectadas y documentadas.
- SonarQube/SonarCloud: configuracion inicial preparada sin secretos.
- Google Fonts: dependencia externa eliminada del frontend.
