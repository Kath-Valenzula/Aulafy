# Migracion de Stack: NestJS + MySQL + AWS

## Contexto

El proyecto Aulafy cambia su stack tecnico para consolidar una base full TypeScript:

- Backend: NestJS.
- Base de datos: MySQL.
- Infraestructura: AWS.
- Integracion y despliegue: GitHub Actions.

Este documento define alcance, estrategia, riesgos y entregables de la migracion.

## Alcance de migracion

### Incluido

- Nuevo backend en `backend/aulafy-api-nest`.
- Contratos API equivalentes para modulos existentes.
- Migracion de scripts SQL de PostgreSQL a MySQL.
- Adaptacion de configuraciones de entorno y pipelines CI/CD.
- Documentacion tecnica y operativa actualizada.

### Fuera de alcance en esta fase inicial

- Retiro definitivo del backend legado Spring.
- Migraciones de datos productivos historicos.
- Optimizaciones de rendimiento avanzadas.

## Estrategia

Se aplica el patron de migracion incremental por convivencia temporal:

1. Crear backend NestJS con modulos base.
2. Migrar dominio por dominio desde Spring a NestJS.
3. Validar contratos con frontend Angular en cada iteracion.
4. Consolidar despliegue AWS y retirar stack legado cuando exista paridad funcional.

## Arquitectura objetivo resumida

- Frontend Angular con dos experiencias: App y Backoffice.
- API NestJS monolitica modular.
- Persistencia MySQL con TypeORM.
- Integracion Telegram para comunicaciones/chat.
- CI/CD con GitHub Actions hacia AWS.

## Matriz de migracion por modulo

| Modulo | Estado migracion | Accion siguiente |
| --- | --- | --- |
| Health | Operativo | Mantener endpoint de control operativo |
| Auth | Operativo | Endurecer estrategia JWT y evaluar refresh token |
| Users | Operativo | Extender validaciones y casos de uso administrativos |
| Chat | Operativo | Incorporar pruebas automáticas y evidencias funcionales |
| Calendar | Operativo | Ajustar recordatorios y filtros avanzados |
| Annotations | Operativo | Fortalecer analítica y seguimiento de estado |
| Academic | Operativo | Mejorar cobertura de pruebas por endpoint |
| Attendance | Operativo | Mejorar cobertura de pruebas por endpoint |
| Feed/Comments | Operativo | Agregar capacidades de moderación |
| Notifications | Operativo | Consolidar pruebas de envío en entorno staging |

## Riesgos y mitigaciones

- **Riesgo:** divergencia funcional entre backend legado y backend nuevo.  
  **Mitigacion:** checklist de paridad por endpoint antes de cierre de modulo.

- **Riesgo:** cambios de contrato que rompan frontend.  
  **Mitigacion:** versionado de DTOs y pruebas de contrato por modulo.

- **Riesgo:** diferencias SQL entre PostgreSQL y MySQL.  
  **Mitigacion:** scripts de migracion controlados y datos semilla equivalentes.

- **Riesgo:** despliegue AWS incompleto.  
  **Mitigacion:** ambientes `dev` y `staging` con pipeline progresivo y health checks.

## Definicion de terminado (DoD) por modulo

- Endpoints implementados en NestJS.
- Reglas de autorizacion equivalentes validadas.
- Cobertura minima de pruebas unitarias/integracion para casos criticos.
- Documentacion de uso y despliegue actualizada.
- Evidencia de ejecucion en entorno local/staging.
