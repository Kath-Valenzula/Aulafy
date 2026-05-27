# Plan de riesgos

| Riesgo | Impacto | Probabilidad | Mitigacion |
| --- | --- | --- | --- |
| Costos Azure inesperados | Alto | Media | Crear recursos pagados solo con autorizacion y borrar RG si no se usa. |
| Secretos subidos al repositorio | Alto | Baja | Usar `.env.example`, GitHub Secrets y App Settings. |
| Fallas CORS en staging | Medio | Media | Configurar `FRONTEND_URL` real y reiniciar App Service. |
| Permisos incompletos | Alto | Media | Validar backend con `AccessControlService` y pruebas 401/403. |
| Demo sin datos | Medio | Baja | Mantener `DataInitializer` y `seed.sql`. |
| Telegram no configurado | Bajo | Alta | Registrar `NO_CONFIGURADO` sin romper la app. |
| Build Angular falla por entorno | Medio | Media | Mantener `environment.staging.ts` y `npm run build:staging`. |
