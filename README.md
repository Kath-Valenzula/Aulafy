# Aulafy

Aulafy es una plataforma web de comunicacion y gestion escolar para centralizar publicaciones, calendario academico, notas, asistencia y notificaciones por Telegram. El MVP esta construido como arquitectura monolitica modular cliente-servidor, con Spring Boot para la API, Angular para la interfaz y PostgreSQL como base de datos.

## Integrantes

- Katherine Gisselle Valenzuela Moreno
- Sebastian Alberto Briceno Inostroza

Profesor: Alonso Esteban Castillo Pizarro

## Stack tecnico

- Backend: Java 17, Spring Boot 3.5.14, Maven, Spring Web, Spring Data JPA, Spring Security, JWT, Bean Validation, PostgreSQL.
- Frontend: Angular 21, TypeScript, SCSS, Angular Router, Reactive Forms, HttpClient, guards e interceptor JWT.
- Base de datos: PostgreSQL 16 mediante Docker Compose.
- Pruebas: JUnit 5, Mockito y Spring Boot Test.

## Arquitectura

El proyecto usa un monolito modular separado en cliente web y API REST:

- `frontend/aulafy-web`: aplicacion Angular mobile-first.
- `backend/aulafy-api`: API Spring Boot con modulos por dominio.
- `database`: scripts SQL de esquema y datos demo.
- `docs`: documentacion tecnica, casos de uso y plan de pruebas.

No se usan microservicios porque el MVP requiere simplicidad operativa, menor costo de despliegue y trazabilidad clara para una entrega academica. La separacion modular queda dentro del backend para poder crecer sin partir el sistema prematuramente.

## Modulos principales

- Autenticacion JWT y roles.
- Administracion de usuarios.
- Administracion de cursos.
- Muro de publicaciones y comentarios.
- Calendario academico.
- Seguimiento de notas y resumen academico.
- Registro y resumen de asistencia.
- Notificaciones Telegram preparadas por variables de entorno.

## Roles

- `ADMIN`
- `COLEGIO`
- `PROFESOR`
- `APODERADO`
- `ESTUDIANTE`

Para el MVP cada usuario tiene un rol principal. La estructura queda preparada para extender permisos si luego se requiere un modelo de multiples roles.

## Ejecucion

Base de datos:

```bash
docker compose up -d
```

Backend:

```bash
cd backend/aulafy-api
mvn clean test
mvn spring-boot:run
```

Frontend:

```bash
cd frontend/aulafy-web
npm install
npm start
```

La interfaz queda disponible en `http://localhost:4200` y la API en `http://localhost:8080/api`.

## Variables de entorno

```bash
DB_URL=jdbc:postgresql://localhost:5432/aulafy_db
DB_USERNAME=aulafy_user
DB_PASSWORD=aulafy_pass
JWT_SECRET=definir-una-clave-larga-para-produccion
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

Si Telegram no esta configurado, la API registra el intento como `NO_CONFIGURADO` y la aplicacion sigue funcionando.

## Credenciales demo

- `admin@aulafy.cl` / `Admin1234`
- `colegio@aulafy.cl` / `Colegio1234`
- `profesor@aulafy.cl` / `Profesor1234`
- `apoderado@aulafy.cl` / `Apoderado1234`
- `estudiante@aulafy.cl` / `Estudiante1234`

## Estado actual del MVP

- Backend compila y tiene 5 pruebas unitarias verdes.
- Frontend compila y consume endpoints reales de la API.
- Datos demo se cargan con `CommandLineRunner` cuando la base esta vacia.
- Telegram queda integrado de forma modular sin credenciales en el repositorio.
- La documentacion tecnica inicial esta disponible en `docs`.

## Roadmap

1. Ajustar permisos por pertenencia real a curso y vinculo apoderado-estudiante.
2. Agregar endpoints de administracion de evaluaciones y asignaturas.
3. Mejorar manejo de errores visuales en formularios Angular.
4. Agregar pruebas de integracion para controladores con seguridad.
5. Preparar despliegue con perfiles `dev`, `test` y `prod`.
