# Checklist staging

## Antes de crear recursos

- [ ] Backend compila.
- [ ] Frontend compila.
- [ ] Tests pasan.
- [ ] README actualizado.
- [ ] No hay secretos en el repositorio.
- [ ] Scripts `infra/azure` revisados.
- [ ] Costo de PostgreSQL y App Service autorizado por el equipo.

## Azure

- [x] Resource Group creado: `rg-aulafy-staging`.
- [ ] PostgreSQL creado.
- [ ] Base de datos creada.
- [ ] App Service creado.
- [ ] Static Web App creada.
- [ ] Variables configuradas.
- [ ] GitHub Secrets configurados.
- [ ] Workflows ejecutados.

## Validacion

- [ ] `/api/health` responde.
- [ ] Frontend abre.
- [ ] Login funciona.
- [ ] Dashboard funciona.
- [ ] Publicaciones funcionan.
- [ ] Calendario funciona.
- [ ] Notas/asistencia funcionan.
- [ ] Telegram probado o documentado como pendiente.

## Costos

- [x] No se crearon PostgreSQL, App Service Plan ni App Service en esta iteracion.
- [x] No se ejecutaron workflows de despliegue que requieran secretos reales.
- [ ] Eliminar Resource Group si no se usara para evidencia o demo.
