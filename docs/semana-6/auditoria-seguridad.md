# Auditoria de seguridad minima - Semana 6

Proyecto: Aulafy  
Fecha: 26/06/2026  
Arquitectura: cliente-servidor / monolito modular  
Stack vigente: Angular 21, NestJS, Node.js, TypeScript, MySQL 8.x, TypeORM y AWS para revision academica.

## Objetivo

Registrar el estado de seguridad minima del proyecto y las mejoras aplicadas sin cambiar funcionalidades de negocio ni redisenar la arquitectura.

## CORS

Estado anterior:

- El backend NestJS estaba configurado con `cors: true` en `src/main.ts`.
- Esa configuracion permitia origenes abiertos y no era adecuada para un entorno publicado.

Estado actualizado:

- CORS queda controlado por una lista explicita de origenes permitidos.
- Se permiten los origenes locales de desarrollo:
  - `http://localhost:4200`
  - `http://127.0.0.1:4200`
- Se permite el frontend academico publicado en AWS:
  - `http://aulafy-frontend-803615173905.s3-website.us-east-2.amazonaws.com`
- Tambien se permite el valor configurado en `FRONTEND_URL`, para mantener flexibilidad entre local, staging y futuros cambios de dominio.
- Las peticiones sin cabecera `Origin`, como health checks o llamadas server-to-server, se mantienen permitidas.

## Helmet

Estado actualizado:

- Se agrego `helmet` al backend NestJS.
- La configuracion se aplico de forma conservadora para una API REST:
  - `contentSecurityPolicy: false`
  - `crossOriginEmbedderPolicy: false`
- Esta configuracion mejora cabeceras HTTP sin bloquear el consumo normal desde Angular ni el endpoint `/api/health`.

## JWT

Estado actual:

- El login se realiza en `POST /api/auth/login`.
- El backend valida usuario activo y contrasena con `bcryptjs`.
- El JWT se genera con `JwtService`.
- El payload incluye:
  - `sub`: identificador del usuario.
  - `email`: correo del usuario.
  - `role`: rol principal del usuario.
- La expiracion configurada es de 2 horas.
- El frontend guarda el token en `localStorage` con la clave `aulafy_token`.
- El interceptor Angular adjunta el token como `Authorization: Bearer <token>`.
- El cierre de sesion actual elimina el token y el usuario desde `localStorage`.
- Los guards del backend validan token y roles antes de permitir rutas protegidas.

Riesgos conocidos:

- El cierre de sesion es local; el token sigue siendo valido en el servidor hasta expirar.
- `localStorage` es simple para el MVP, pero no es el mecanismo mas robusto frente a XSS.
- No existe refresh token.
- No existe invalidacion server-side, blacklist ni versionado de sesion.

Mejoras futuras recomendadas:

- Implementar refresh token con expiracion corta para access token.
- Agregar invalidacion server-side de sesiones.
- Implementar rotacion periodica de `JWT_SECRET`.
- Evaluar almacenamiento mas seguro segun el modelo de despliegue.
- Agregar blacklist o versionado de sesion para cierre de sesion real en servidor.
- Registrar intentos fallidos de login y aplicar rate limiting.

## Secretos y variables de entorno

Estado actualizado:

- `.env` y variantes locales siguen excluidas por `.gitignore`.
- `.env.example` no contiene contrasenas reales ni secretos reutilizables.
- `JWT_SECRET` queda como placeholder:
  - `CAMBIAR_POR_SECRETO_SEGURO_DE_64_CARACTERES`
- `DB_PASSWORD` queda como placeholder:
  - `CAMBIAR_POR_PASSWORD_LOCAL`

Buenas practicas:

- No subir `.env` al repositorio.
- Configurar secretos de AWS en Elastic Beanstalk mediante variables de entorno.
- No documentar passwords reales en Word, README, scripts ni capturas.
- Cambiar secretos si alguna vez fueron expuestos en consola, documentos o repositorio.

## Despliegue AWS

Estado actual de Semana 5:

- Frontend publicado en Amazon S3 Static Website.
- Backend publicado en AWS Elastic Beanstalk.
- Base de datos MySQL publicada en Amazon RDS para revision academica.

Mejoras aplicadas al script de despliegue:

- El script no imprime `DB_PASS` en consola.
- El script ya no configura MySQL abierto a `0.0.0.0/0`.
- La recreacion segura debe permitir MySQL solo desde el Security Group del backend.
- Se actualizo `FRONTEND_URL` al dominio real del frontend en S3.
- Se dejo advertencia de que RDS publico fue usado solo para demo academica y debe cerrarse en produccion.

Pendiente tecnico:

- Automatizar la resolucion del Security Group de Elastic Beanstalk y enlazarlo al Security Group de RDS.
- Definir un procedimiento de migracion para cerrar acceso publico de RDS sin romper el entorno de revision.
- Revisar costos y apagar recursos AWS cuando no se necesiten para evaluacion.

## Estado final de seguridad minima

- CORS abierto reemplazado por CORS controlado.
- Helmet agregado al backend.
- JWT documentado con estado actual y riesgos.
- `.env.example` saneado con placeholders.
- Script AWS ajustado para no proponer una configuracion insegura de RDS.

Estas mejoras no cambian funcionalidades de negocio, roles, endpoints ni arquitectura del sistema.
