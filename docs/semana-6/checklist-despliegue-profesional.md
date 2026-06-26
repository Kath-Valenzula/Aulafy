# Checklist de despliegue profesional - Aulafy Semana 6

Fecha: 26/06/2026  
Ambiente objetivo: staging profesional AWS

## Frontend y HTTPS

- [ ] CloudFront creado para el bucket `aulafy-frontend-803615173905`.
- [ ] `index.html` configurado como root object.
- [ ] Errores 403/404 redirigidos a `/index.html` para soportar rutas Angular SPA.
- [ ] HTTPS activo mediante dominio default `https://xxxxx.cloudfront.net` o dominio propio.
- [ ] Si hay dominio propio, certificado ACM creado en `us-east-1`.
- [ ] Certificado ACM validado por DNS.
- [ ] DNS del dominio propio apuntando a CloudFront.
- [ ] Cache invalidada despues de despliegues frontend.

## Backend y CORS

- [ ] Backend Elastic Beanstalk operativo.
- [ ] `/api/health` responde correctamente.
- [ ] `FRONTEND_URL` actualizado al dominio HTTPS final.
- [ ] CORS restringido a:
  - [ ] `http://localhost:4200`
  - [ ] `http://127.0.0.1:4200`
  - [ ] dominio HTTPS de CloudFront o dominio propio.
- [ ] No se usa `Access-Control-Allow-Origin: *` en staging.

## Base de datos RDS

- [ ] RDS MySQL no publica en futuras recreaciones.
- [ ] Security Group de RDS no permite `0.0.0.0/0` en puerto 3306.
- [ ] Puerto 3306 permitido solo desde Security Group del backend Elastic Beanstalk.
- [ ] Credenciales de base de datos fuera del repositorio.
- [ ] Backups revisados segun necesidad academica.
- [ ] Plan de rollback documentado antes de cerrar acceso publico del entorno actual.

## Secretos y configuracion

- [ ] `.env` no versionado.
- [ ] `DB_PASSWORD` no expuesto en documentos, scripts ni consola.
- [ ] `JWT_SECRET` no expuesto en documentos, scripts ni consola.
- [ ] Parametros creados en SSM Parameter Store o Secrets Manager.
- [ ] `DB_PASSWORD` guardado como `SecureString`.
- [ ] `JWT_SECRET` guardado como `SecureString`.
- [ ] Permisos IAM revisados para consumo seguro de secretos.

## Costos y gobierno AWS

- [ ] AWS Budget creado.
- [ ] Limite mensual definido, sugerido USD 5 para staging academico.
- [ ] Alertas al 80% y 100% configuradas.
- [ ] Correo de alerta confirmado.
- [ ] Recursos etiquetados:
  - [ ] `Project=Aulafy`
  - [ ] `Environment=Staging`
  - [ ] `Owner=Grupo8`
- [ ] Plan de apagado de staging definido.
- [ ] Monitoreo de costos revisado semanalmente.

## Validacion tecnica

- [ ] Frontend carga por HTTPS.
- [ ] Login funciona con usuarios demo.
- [ ] Dashboard correcto por rol.
- [ ] API responde desde frontend HTTPS.
- [ ] Reportes y riesgo no quedan en carga infinita.
- [ ] Telegram se mantiene opcional.
- [ ] Chat interno sigue clasificado como experimental/post-MVP.
- [ ] `npm run build` backend OK.
- [ ] `npm test` backend OK.
- [ ] `npm run build` frontend OK.

## Evidencia sugerida Semana 6

- [ ] Captura de CloudFront HTTPS.
- [ ] Captura de `/api/health`.
- [ ] Captura de Budget AWS.
- [ ] Captura de parametros SSM sin mostrar valores secretos.
- [ ] Captura de Security Group de RDS sin `0.0.0.0/0`.
- [ ] Captura de login y dashboard por rol.

## Estado actual

- [x] Documentacion profesional preparada.
- [x] Scripts base seguros preparados.
- [x] CORS backend ya restringido por lista de origenes.
- [x] Helmet agregado al backend.
- [x] `.env.example` saneado con placeholders.
- [ ] CloudFront no creado todavia.
- [ ] Budget no creado todavia.
- [ ] Parametros SSM no creados todavia.
- [ ] RDS actual no modificada en esta auditoria.
