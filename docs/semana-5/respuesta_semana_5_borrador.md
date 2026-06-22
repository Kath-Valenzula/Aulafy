# Respuesta Semana 5

Documento de referencia: `TSY2201_EXP2_S5_Formato_respuesta_Iniciando el desarrollo del software.docx`

---

## Portada

**Nombre estudiante:**
Katherine Gisselle Valenzuela Moreno
Sebastián Alberto Briceño Inostroza

**Asignatura:**
Taller Aplicado de Software

**Carrera:**
Ingeniería en Desarrollo de Software

**Profesor:**
Alonso Esteban Castillo Pizarro

**Fecha:**
Junio 2026

---

## 1. Link con información del proyecto

<https://github.com/Kath-Valenzula/Aulafy>

El proyecto Aulafy se encuentra versionado en GitHub en un repositorio público. El repositorio contiene el código fuente del frontend Angular, backend NestJS, scripts de base de datos MySQL, documentación académica, mockups, evidencias y workflows de integración continua. Los avances se respaldan mediante commits incrementales y organización por capas del sistema.

---

## 2. Link con acceso al sistema

<https://shaggy-colts-cheat.loca.lt>

El sistema se encuentra disponible en un entorno de demostración temporal publicado mediante túnel público. El acceso permite revisar la pantalla de inicio de sesión, navegación por roles, dashboards y módulos académicos implementados. Este entorno se mantiene activo mientras el servidor local del equipo permanece encendido durante la revisión.

---

## 3. Instrucciones de avance

En este estado de avance, Aulafy cuenta con una versión funcional del MVP compuesta por frontend Angular, backend NestJS y base de datos MySQL. El sistema permite iniciar sesión mediante JWT con usuarios demo y redirigir a cada perfil según rol: ADMIN, COLEGIO, PROFESOR, APODERADO y ESTUDIANTE.

Las funcionalidades disponibles incluyen autenticación, dashboards por rol, gestión y visualización parcial de usuarios, consulta de cursos, asignaturas, calendario académico, evaluaciones, notas, asistencia, anotaciones académicas/conductuales, reporte de riesgo académico, publicaciones/comunicados, comentarios y registro de notificaciones externas. La integración con Telegram se mantiene como funcionalidad opcional con fallback controlado cuando no existen credenciales configuradas.

La arquitectura implementada no corresponde a microservicios, sino a una arquitectura cliente-servidor / monolito modular separado en frontend Angular, API REST NestJS y base de datos MySQL. Esta decisión permite mantener simplicidad operativa, trazabilidad clara y menor costo para el MVP académico.

### Tabla de funcionalidades

| Funcionalidad | Estado | Disponible en servidor | Observación |
| --- | --- | --- | --- |
| Login con JWT | Implementado | Sí | Token JWT con expiración de 2 horas |
| Cierre de sesión | Parcial | Sí | Cliente borra token; backend no invalida JWT |
| Roles (ADMIN, COLEGIO, PROFESOR, APODERADO, ESTUDIANTE) | Implementado | Sí | Guards en backend y rutas protegidas en frontend |
| Dashboards por rol | Parcial | Sí | Navegación diferenciada; sin KPIs de negocio reales |
| Gestión/visualización de usuarios | Parcial | Sí | Backend CRUD completo; frontend solo lectura |
| Cursos | Parcial | Sí | Backend completo; frontend solo lectura |
| Asignaturas | Parcial | Sí | Backend permite creación; frontend solo lectura |
| Evaluaciones | Implementado | Sí | Registro y consulta funcional extremo a extremo |
| Notas | Implementado | Sí | Registro, consulta y cálculo de promedio/estado académico |
| Asistencia | Parcial | Sí | Registro y resumen funcionan; justificación de ausencias pendiente |
| Calendario académico | Implementado | Sí | Eventos por curso con notificación opcional vía Telegram |
| Publicaciones/comunicados | Implementado | Sí | Creación y consulta por curso |
| Comentarios | Implementado | Sí | Asociados a publicaciones con control de habilitación |
| Anotaciones académicas/conductuales | Implementado | Sí | Registro y consulta, notificación a estudiante y apoderado |
| Perfil apoderado | Parcial | Sí | Lectura de datos y estudiantes vinculados; sin edición |
| Vista estudiante | Parcial | Sí | Reutiliza experiencia de apoderado con diferencias textuales |
| Reporte de riesgo académico | Implementado | Sí | Cálculo real: promedio, asistencia, severidad |
| Notificaciones externas (Telegram) | Implementado (opcional) | Sí | Envío real con credenciales; modo degradado `NOT_CONFIGURED` sin ellas |
| Chat interno | Post-MVP / experimental | Parcial | Persistencia REST real; sin tiempo real (sin WebSocket) |

---

## Pruebas y validación

| Validación | Resultado |
| --- | --- |
| `npm run build` backend | PASÓ — compilación TypeScript sin errores |
| `npm test` backend | PASÓ — suites de auth, acceso académico, anotaciones, cursos, riesgo y smoke |
| `npm ci` frontend | PASÓ — 471 paquetes instalados, lockfile sincronizado |
| `npm run build` frontend | PASÓ — bundle generado sin errores |
| `npm run build:staging` frontend | PASÓ — bundle staging generado sin errores |
| `docker compose up -d` | PASÓ — MySQL 8.4 levantado con schema.sql y seed.sql cargados |
| `/api/health` backend | PASÓ — estado `UP` en entorno development |
| Frontend local | PASÓ — `http://localhost:4200` responde con título Aulafy |
| Link público temporal | PASÓ — `https://shaggy-colts-cheat.loca.lt` responde con título Aulafy |
| Proxy público `/api/health` | PASÓ — el enlace temporal redirige correctamente al backend |
| Login ADMIN por API local y pública | PASÓ — respuesta con usuario ADMIN y token JWT |
| Cuentas demo por API pública | PASÓ — ADMIN, COLEGIO, PROFESOR, APODERADO y ESTUDIANTE devuelven el rol esperado con token JWT |
| Login visual y menús por rol | Pendiente de validación manual en navegador durante revisión |

### Cuentas demo utilizadas en la validación

| Rol | Email | Contraseña |
| --- | --- | --- |
| ADMIN | `admin@aulafy.cl` | Admin1234 |
| COLEGIO | `colegio@aulafy.cl` | Colegio1234 |
| PROFESOR | `profesor@aulafy.cl` | Profesor1234 |
| APODERADO | `apoderado@aulafy.cl` | Apoderado1234 |
| ESTUDIANTE | `estudiante@aulafy.cl` | Estudiante1234 |

---

## Respuesta a observaciones de retroalimentación Semana 4

### 1. Profesor jefe vs profesor

El rol `PROFESOR` representa al docente general del sistema. La condición de profesor jefe no se modela como un rol global separado, porque un mismo docente puede ser profesor jefe en un curso y profesor de asignatura en otro simultáneamente. Asignarle un rol distinto en el sistema implicaría duplicar usuarios o perder esa flexibilidad.

La mejora propuesta es modelar esta distinción a nivel de curso, agregando un campo `teacher_type` o `is_head_teacher` en la tabla `course_teachers`. Así el sistema puede consultar quién es profesor jefe de un curso específico sin alterar el modelo de roles existente.

### 2. Superusuario del chat

El superusuario del chat será el profesor jefe del curso, en su rol de moderador de la sala. Sus atribuciones incluyen crear la sala, cerrar o reabrir la conversación y desactivar mensajes con trazabilidad completa (quién desactivó y cuándo).

La mejora propuesta es agregar los campos `moderator_id`, `status`, `closed_at`, `deleted_at` y `deleted_by_id` en las entidades `chat_rooms` y `chat_messages`. Esto permite auditoría de acciones de moderación sin eliminar registros físicamente.

### 3. Acceso del apoderado al chat

El Muro y el Chat son módulos distintos con persistencia separada. El Muro utiliza las entidades `posts` y `comments`, orientado a publicaciones del curso. El Chat utiliza `chat_rooms` y `chat_messages`, orientado a comunicación directa.

El apoderado no inicia chats; solo puede responder en salas abiertas por el profesor jefe de su curso. Como mejora de Semana 5/6 se agrega acceso visible al módulo "Chat" en el menú del apoderado, de forma que pueda ver y participar en las salas a las que pertenece.

### 4. Rol Colegio

El rol `COLEGIO` corresponde al administrador institucional del establecimiento educativo: gestiona cursos, usuarios docentes y estructura académica del colegio. Es distinto del rol `ADMIN`, que queda reservado para administración técnica o global del sistema (soporte, configuración de infraestructura).

Para mayor claridad en la documentación, este rol se etiquetará como `COLEGIO / Administrador institucional`.

---

Estas cuatro observaciones se incorporan como mejoras evolutivas del MVP para Semana 5 y Semana 6, sin alterar la arquitectura base ya implementada.
