# Registro de Decisiones Técnicas (ADR) — Aulafy

> ADR = Architecture Decision Record
> Registra el POR QUÉ de las decisiones, no solo el qué.

---

## Formato
```
## [ADR-XXX] Título
**Fecha**: YYYY-MM-DD
**Estado**: Activa | Deprecada
**Contexto**: Por qué se necesitaba decidir esto
**Decisión**: Qué se decidió
**Razón**: Por qué esta opción sobre las alternativas
**Consecuencias**: Qué implica a futuro
```

---

## [ADR-009] CI/CD orientado a AWS con ECS + S3/CloudFront

**Fecha**: 2026-05-30
**Estado**: Activa
**Contexto**: El repositorio aun mantenia workflows de Azure y no estaba alineado al objetivo de infraestructura AWS.
**Decision**: Consolidar pipelines GitHub Actions para AWS: CI backend/frontend, deploy backend a ECS (imagen en ECR) y deploy frontend a S3 con invalidacion CloudFront.
**Razon**: Cierra la brecha entre arquitectura objetivo y automatizacion real del repositorio.
**Consecuencias**: Requiere configurar variables OIDC/AWS en GitHub y recursos en cuenta AWS para ejecutar despliegues reales.

---

## [ADR-008] Chat interno por salas de curso con permisos academicos

**Fecha**: 2026-05-30
**Estado**: Activa
**Contexto**: El modulo `chat` estaba en estado inicial sin persistencia ni reglas de acceso por curso.
**Decision**: Modelar `chat_rooms` y `chat_messages`, aplicar control por rol/pertenencia academica y notificar mensajes via Telegram a participantes del curso.
**Razon**: Provee trazabilidad, persistencia y coherencia con el modelo academico existente sin introducir complejidad de microservicios.
**Consecuencias**: Aumenta superficie de pruebas en comunicaciones y depende de calidad de datos `telegram_chat_id` para entrega externa.

---

## [ADR-007] Notificaciones Telegram con modo degradado y trazabilidad

**Fecha**: 2026-05-30
**Estado**: Activa
**Contexto**: El proyecto necesita operar aun cuando Telegram no este configurado en todos los entornos.
**Decision**: Centralizar envios en el modulo `notifications` y, si falta `TELEGRAM_BOT_TOKEN`, registrar intento con estado `NOT_CONFIGURED` en `notification_logs` sin romper flujo funcional.
**Razon**: Permite continuidad operativa y observabilidad de notificaciones desde backoffice sin depender de setup externo inmediato.
**Consecuencias**: Se preserva auditoria por destinatario; al habilitar token, el mismo flujo pasa a envio real sin cambios de frontend.

---

## [ADR-006] Disparadores automaticos de notificacion por dominio

**Fecha**: 2026-05-30
**Estado**: Activa
**Contexto**: Las notificaciones manuales no cubren eventos criticos del proceso academico.
**Decision**: Disparar notificaciones automaticas al crear eventos de calendario con `notifyTelegram=true` y al crear anotaciones de estudiante, resolviendo destinatarios por relaciones academicas.
**Razon**: Acerca la plataforma al comportamiento esperado de comunicacion escolar y reutiliza la infraestructura de notificaciones existente.
**Consecuencias**: Mayor volumen de logs y dependencia de calidad de datos `telegram_chat_id`; requiere monitoreo y reglas de deduplicacion.

---

## [ADR-005] Modelo academico inicial alineado a childsafe

**Fecha**: 2026-05-30
**Estado**: Activa
**Contexto**: Se requiere base academica consistente para cursos, asistencia, notas y anotaciones durante la migracion.
**Decision**: Adoptar estructura `levels`, `cycles`, `cycle_levels`, `students` y puentes de migracion MySQL para bases previas.
**Razon**: Reduce ambiguedad de negocio y acelera implementacion funcional reutilizando un modelo ya validado.
**Consecuencias**: Se mantiene compatibilidad progresiva con datos legacy; aumenta complejidad temporal en scripts de bridge.

---

## [ADR-004] Monolito modular como arquitectura objetivo del MVP

**Fecha**: 2026-05-30
**Estado**: Activa
**Contexto**: El alcance actual exige rapidez de entrega y menor complejidad operacional.
**Decision**: Implementar backend NestJS como monolito modular por dominios (`auth`, `users`, `courses`, `academic`, etc.).
**Razon**: Simplifica despliegue, debugging y control de cambios para el equipo y el contexto academico del proyecto.
**Consecuencias**: Menor costo operacional inicial; si crece el trafico o el equipo, se evaluara particion posterior.

---

## [ADR-003] Frontend Angular unico con experiencias por rol

**Fecha**: 2026-05-30
**Estado**: Activa
**Contexto**: Se necesitan dos experiencias (familias/alumnos y backoffice) sin duplicar stack.
**Decision**: Mantener una sola aplicacion Angular con layout/rutas/guardias por rol y vistas Stitch por feature.
**Razon**: Evita sobrecoste de dos frontends, mantiene coherencia visual y acelera iteraciones.
**Consecuencias**: El enrutamiento y permisos concentran complejidad en el cliente; requiere disciplina de guardias y modelos compartidos.

---

## [ADR-002] Backend legacy Spring como referencia temporal

**Fecha**: 2026-05-30
**Estado**: Activa (provisional)
**Contexto**: La migracion de stack no finaliza en una sola iteracion.
**Decision**: Conservar `backend/aulafy-api` como referencia funcional mientras `backend/aulafy-api-nest` alcanza paridad.
**Razon**: Permite validar reglas de negocio heredadas y reducir riesgo de regresiones.
**Consecuencias**: Existe deuda temporal de doble referencia tecnica; debe retirarse al cerrar paridad funcional y pruebas.

---

## [ADR-001] Stack tecnológico inicial

**Fecha**: 2026-05-30
**Estado**: Activa
**Decisión**: NestJS + Angular + MySQL + AWS (GitHub Actions CI/CD)
**Razon**: Unificar desarrollo TypeScript end-to-end, simplificar mantenimiento y alinear el roadmap de despliegue con CI/CD.
**Consecuencias**: Requiere migracion incremental de backend legacy, estandarizacion de variables de entorno y cierre de pipelines por entorno.

---
<!-- Agente: nuevas entradas ARRIBA de esta línea -->
