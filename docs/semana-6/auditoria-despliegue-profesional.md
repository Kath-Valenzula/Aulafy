# Auditoria de despliegue profesional - Semana 6

Proyecto: Aulafy  
Fecha: 26/06/2026  
Arquitectura: cliente-servidor / monolito modular  
Stack: Angular 21, NestJS, Node.js, TypeScript, MySQL 8.x, TypeORM y AWS.

## Objetivo

Preparar el paso desde un despliegue academico funcional hacia un staging profesional, sin borrar ni romper los recursos AWS actuales usados en Semana 5.

## Estado actual del despliegue AWS

Recursos usados en Semana 5:

- Frontend Angular en Amazon S3 Static Website:
  - `http://aulafy-frontend-803615173905.s3-website.us-east-2.amazonaws.com`
- Backend NestJS en AWS Elastic Beanstalk:
  - `http://aulafy-api-staging.eba-uuqbidym.us-east-2.elasticbeanstalk.com/api`
  - Health check: `http://aulafy-api-staging.eba-uuqbidym.us-east-2.elasticbeanstalk.com/api/health`
- Base de datos MySQL en Amazon RDS.
- Region principal usada: `us-east-2`.
- Uso actual: demostracion academica y revision funcional.

No se ejecutaron cambios sobre AWS durante esta auditoria.

## Riesgos actuales

| Riesgo | Impacto | Estado |
| --- | --- | --- |
| Frontend servido por HTTP desde S3 Static Website | Trafico sin HTTPS en la URL principal | Requiere CloudFront |
| Backend Elastic Beanstalk expuesto por HTTP | API sin HTTPS propio si se usa CNAME default | Requiere HTTPS o dominio/proxy seguro |
| RDS publico usado para demo academica | Mayor superficie de ataque | Debe cerrarse en staging profesional |
| Secretos como variables de entorno directas | Gestion manual y riesgo operacional | Migrar a SSM/Secrets Manager |
| Sin AWS Budget documentado | Riesgo de costos no controlados | Crear presupuesto mensual |
| Sin dominio propio | CloudFront puede usar dominio default, pero no URL institucional | Opcional segun evaluacion |

## Propuesta profesional

Staging profesional recomendado:

1. Servir el frontend desde CloudFront con HTTPS.
2. Mantener S3 como origen del frontend, sin exponerlo como URL principal.
3. Usar AWS Certificate Manager para dominio propio si existe dominio real.
4. Restringir CORS del backend al dominio HTTPS final de CloudFront.
5. Mover secretos a SSM Parameter Store SecureString o AWS Secrets Manager.
6. Recrear o ajustar RDS como no publica.
7. Permitir acceso MySQL solo desde el Security Group del backend Elastic Beanstalk.
8. Crear AWS Budget mensual bajo para evitar costos inesperados.
9. Etiquetar recursos con `Project=Aulafy`, `Environment=Staging`, `Owner=Grupo8`.
10. Definir plan de apagado de staging al finalizar la evaluacion.

## CloudFront para frontend

Script preparado:

- `scripts/aws/create-cloudfront-frontend.sh`

Caracteristicas:

- Usa el bucket actual:
  - `aulafy-frontend-803615173905`
- Usa como origen el endpoint S3 Static Website:
  - `aulafy-frontend-803615173905.s3-website.us-east-2.amazonaws.com`
- Configura `index.html` como root object.
- Redirige HTTP a HTTPS en CloudFront.
- Maneja rutas SPA enviando errores 403/404 a `/index.html` con codigo 200.
- Permite crear distribucion sin dominio propio usando el certificado default de CloudFront.
- Permite dominio propio solo si se entrega `CUSTOM_DOMAIN` y `ACM_CERT_ARN`.

Uso seguro para revisar configuracion:

```bash
bash scripts/aws/create-cloudfront-frontend.sh
```

Uso para crear distribucion, solo con confirmacion explicita:

```bash
CONFIRM_CREATE_CLOUDFRONT=yes bash scripts/aws/create-cloudfront-frontend.sh
```

Con dominio propio:

```bash
CUSTOM_DOMAIN=app.ejemplo.cl \
ACM_CERT_ARN=arn:aws:acm:us-east-1:123456789012:certificate/xxxx \
CONFIRM_CREATE_CLOUDFRONT=yes \
bash scripts/aws/create-cloudfront-frontend.sh
```

Pendiente despues de crear CloudFront:

- Tomar el dominio `xxxxx.cloudfront.net`.
- Probar login, dashboards y consumo de API.
- Actualizar `FRONTEND_URL` del backend al dominio HTTPS final.
- Ajustar CORS si se usa dominio propio.
- Invalidar cache cuando se publique una nueva version:

```bash
aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths "/*"
```

## HTTPS con AWS Certificate Manager

Sin dominio propio:

- CloudFront entrega un dominio HTTPS propio:
  - `https://xxxxx.cloudfront.net`
- No se requiere comprar dominio ni crear certificado ACM.

Con dominio propio:

- Se requiere un dominio real.
- El certificado ACM para CloudFront debe crearse en `us-east-1`.
- La validacion debe hacerse por DNS.
- No se debe inventar dominio ni crear certificado sin dominio real.

Pasos recomendados con dominio:

1. Definir dominio real, por ejemplo `app.dominio-real.cl`.
2. Solicitar certificado en ACM `us-east-1`.
3. Validar por DNS en el proveedor del dominio.
4. Crear o actualizar CloudFront con `Aliases` y `ACM_CERT_ARN`.
5. Crear registro DNS `CNAME` o `A/AAAA Alias` hacia CloudFront.
6. Probar HTTPS.
7. Actualizar `FRONTEND_URL` y CORS del backend.

## AWS Budget

Script preparado:

- `scripts/aws/create-budget-alert.sh`

Objetivo:

- Crear un presupuesto mensual bajo para staging academico.
- Valor sugerido: USD 5 mensual.
- Alertas al 80% y 100%.

Uso seguro:

```bash
ALERT_EMAIL="correo@ejemplo.cl" bash scripts/aws/create-budget-alert.sh
```

Crear budget con confirmacion:

```bash
ALERT_EMAIL="correo@ejemplo.cl" \
CONFIRM_CREATE_BUDGET=yes \
bash scripts/aws/create-budget-alert.sh
```

Alternativa manual:

1. Abrir AWS Console.
2. Ir a Billing and Cost Management.
3. Entrar a Budgets.
4. Crear presupuesto de costo mensual.
5. Configurar limite USD 5.
6. Agregar correo de alerta.
7. Confirmar la suscripcion por email si AWS lo solicita.

## Secretos en SSM Parameter Store o Secrets Manager

Script base preparado:

- `scripts/aws/put-parameters-example.sh`

Variables consideradas:

- `DB_HOST`
- `DB_PORT`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `FRONTEND_URL`

Recomendacion:

- Usar SSM Parameter Store con `SecureString` para `DB_PASSWORD` y `JWT_SECRET`.
- Usar `String` para valores no secretos como `DB_HOST`, `DB_PORT`, `DB_DATABASE` y `FRONTEND_URL`.
- No guardar secretos reales en el repositorio.
- No incluir secretos en documentos Word, README ni capturas.

Uso seguro:

```bash
bash scripts/aws/put-parameters-example.sh
```

Guardar parametros, solo con valores reales por variables de entorno y confirmacion:

```bash
CONFIRM_PUT_PARAMETERS=yes \
DB_HOST="endpoint-rds" \
DB_USERNAME="usuario" \
DB_PASSWORD="password-seguro" \
JWT_SECRET="secreto-64-caracteres" \
FRONTEND_URL="https://xxxxx.cloudfront.net" \
bash scripts/aws/put-parameters-example.sh
```

Pendiente tecnico:

- Elastic Beanstalk puede recibir variables desde environment properties.
- Para leer secretos directamente desde SSM/Secrets Manager se requiere ajustar IAM y/o el proceso de despliegue.
- Esa integracion debe hacerse en una etapa posterior con pruebas controladas.

## RDS seguro para futuras recreaciones

Estado revisado:

- `deploy-aws.sh` existe.
- No se ejecuto.
- Ya no propone abrir MySQL a `0.0.0.0/0`.
- Usa `--no-publicly-accessible` para futuras creaciones.
- Incluye `BACKEND_SG` para permitir 3306 solo desde el Security Group del backend.
- Ya no imprime `DB_PASS` en consola.
- Documenta que RDS publica fue solo una decision de demo academica.

Modelo recomendado:

1. RDS MySQL no publico.
2. Security Group de RDS sin reglas abiertas a Internet.
3. Regla 3306 permitida solo desde el Security Group de Elastic Beanstalk.
4. Subnets privadas cuando el diseno de red lo permita.
5. Backups activados si staging debe conservar datos.
6. Deletion protection activado en ambientes no temporales.
7. Credenciales en SSM/Secrets Manager.

## Plan de migracion sugerido

Fase 1 - Preparacion sin impacto:

1. Crear CloudFront sobre el bucket actual.
2. Probar `https://xxxxx.cloudfront.net`.
3. Crear AWS Budget.
4. Guardar parametros en SSM con placeholders reales fuera del repo.

Fase 2 - Ajustes controlados:

1. Configurar `FRONTEND_URL` del backend con la URL HTTPS de CloudFront.
2. Confirmar que CORS permite solo frontend local y CloudFront.
3. Probar login y rutas principales por rol.
4. Tomar evidencia para Semana 6.

Fase 3 - Seguridad de datos:

1. Planificar cierre de RDS publico.
2. Confirmar Security Group real de Elastic Beanstalk.
3. Permitir MySQL solo desde ese Security Group.
4. Probar backend contra RDS privada.
5. Documentar rollback.

## Criterio de listo para staging profesional

Se puede considerar staging profesional cuando:

- Frontend se accede por HTTPS.
- Backend tiene CORS restringido al frontend HTTPS.
- RDS no es publica.
- MySQL no acepta conexiones desde `0.0.0.0/0`.
- Secretos no estan en repositorio ni documentos.
- Existe Budget activo.
- Hay plan de apagado o reduccion de costos.
- Build, tests y login siguen funcionando despues del cambio.

## Veredicto

El despliegue actual cumple como demostracion academica funcional de Semana 5. Para Semana 6, ya existe un plan profesional con scripts base seguros para avanzar a CloudFront, HTTPS, Budget, gestion de secretos y RDS privada sin destruir ni reemplazar los recursos actuales.
