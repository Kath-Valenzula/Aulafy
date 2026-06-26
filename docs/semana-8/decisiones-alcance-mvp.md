# Decisiones de Alcance MVP — Aulafy

**Proyecto:** Aulafy  
**Semana:** 8  
**Fecha:** 2026-06-26  
**Rama base:** develop  
**Rama de trabajo:** feature/semana-8-cierre-mvp-chat-profesor-jefe  
**Repositorio:** https://github.com/Kath-Valenzula/Aulafy

---

## 1. Chat interno entra al MVP como "Mensajes del curso"

**Decisión:** El módulo de chat pasa a ser funcionalidad principal del MVP. La denominación oficial en la interfaz es "Mensajes del curso".

**Justificación:**
- El backend ya disponía de endpoints completos: `GET /api/chat/rooms`, `POST /api/chat/rooms`, `GET /api/chat/rooms/:id/messages`, `POST /api/chat/rooms/:id/messages`.
- El frontend contaba con `ChatComponent` funcional, `ChatService` completo y tablas `chat_rooms` y `chat_messages` en base de datos.
- Solo faltaba conectar la ruta y la navegación por rol.

**Implementación:**
- Ruta: `/app/chat` (reemplaza `/app/chat-profesor`).
- Redirect de compatibilidad: `/app/chat-profesor` → `/app/chat`.
- Roles con acceso en navegación: PROFESOR ("Mensajes del curso"), APODERADO ("Mensajes del curso"), ESTUDIANTE ("Mensajes del curso").
- ADMIN y COLEGIO pueden acceder directamente vía URL si lo necesitan.
- El atributo `experimental: true` fue eliminado de la ruta.

**Limitación conocida:**
El chat usa REST sin WebSocket. Los mensajes nuevos de otros participantes solo se ven al recargar la página. Esto es aceptable para el alcance académico del MVP.

---

## 2. Telegram queda como notificación externa opcional

**Decisión:** Telegram no es el canal de mensajería principal del sistema. Es únicamente una integración opcional de notificaciones externas.

**Justificación:**
- La comunicación interna entre profesor, apoderado y estudiante ocurre dentro de la plataforma a través del módulo "Mensajes del curso".
- Telegram actúa como canal de aviso suplementario cuando un participante no está conectado a la plataforma.
- Las notificaciones Telegram solo se envían si el usuario tiene `telegramChatId` configurado. Si no está configurado, el sistema degrada a modo `NOT_CONFIGURED` sin fallar.

**Implementación:**
- `ChatService.notifyRoomParticipants()` busca participantes del curso con `telegramChatId` y envía notificaciones opcionales.
- `TELEGRAM_BOT_TOKEN` es una variable de entorno opcional. El sistema funciona sin ella.
- No se declaró a Telegram como canal principal en ningún documento o README.

---

## 3. Profesor jefe se formaliza con `role_in_course` en `course_teachers`

**Decisión:** Se agrega la columna `role_in_course VARCHAR(30)` a la tabla `course_teachers` para distinguir el rol del docente dentro del curso.

**Valores definidos:**

| Valor | Descripción |
|---|---|
| `HEAD_TEACHER` | Profesor jefe: responsable principal del curso. |
| `SUBJECT_TEACHER` | Profesor de asignatura: dicta una materia en el curso. |
| `ASSISTANT` | Asistente o co-docente. |

**Valor por defecto:** `SUBJECT_TEACHER`

**Estado del seed demo:**
- `profesor@aulafy.cl` (user id 3) está registrado como `HEAD_TEACHER` en el curso "6 Basico B".

**Impacto en permisos (MVP):**
Para el MVP, todos los docentes registrados en `course_teachers` conservan los mismos permisos de acceso al curso, independientemente de su `role_in_course`. La columna está disponible como dato pero no restringe permisos todavía.

**Regla proyectada (post-MVP):**
En una iteración futura, `assertCanManageCourse` podrá restringir ciertas operaciones de administración de curso exclusivamente al `HEAD_TEACHER`. El `SUBJECT_TEACHER` podría quedar con permisos de visualización y registro académico únicamente.

**Archivos modificados:**
- `database/mysql/schema.sql`: columna `role_in_course` en `CREATE TABLE course_teachers`.
- `database/mysql/seed.sql`: insert actualizado con `role_in_course = 'HEAD_TEACHER'` para el profesor demo.
- `backend/aulafy-api-nest/src/courses/entities/course-teacher.entity.ts`: campo `roleInCourse` con `@Column`.

---

## 4. Riesgo académico como alerta por notas y asistencia

**Decisión:** El módulo `risk` corresponde exclusivamente a riesgo académico temprano. No es un módulo de gestión de conducta ni un sistema de alertas disciplinarias.

**Umbrales activos:**

| Indicador | Umbral de riesgo |
|---|---|
| Promedio de notas | Menor a 4.0 |
| Asistencia | Menor al 85% |

**Tipos de riesgo calculados:**

| Tipo | Condición |
|---|---|
| `ACADEMICO` | Solo promedio bajo |
| `ASISTENCIA` | Solo asistencia baja |
| `COMBINADO` | Ambos indicadores en riesgo |

**Severidad:**

| Nivel | Condición |
|---|---|
| `CRITICO` | Combinado, o promedio < 3.5, o asistencia < 75% |
| `MODERADO` | Riesgo simple sin condición crítica |

**Acceso:** Solo ADMIN y COLEGIO acceden al módulo de riesgo. PROFESOR, APODERADO y ESTUDIANTE no tienen acceso.

**Datos demo:**
- Estudiante Demo: sin riesgo (promedio 6.15, asistencia 100%).
- Ana Gomez: riesgo ACADEMICO CRITICO (promedio 3.35, asistencia 100%).
- Carlos Perez: riesgo ASISTENCIA CRITICO (promedio 5.75, asistencia 50%).

---

## 5. Arquitectura cliente-servidor con backend monolito modular

**Decisión:** La arquitectura sigue siendo cliente-servidor con un monolito modular NestJS. No se introdujeron microservicios.

**Estructura:**

```
frontend/aulafy-web          Angular 21 — cliente web SPA
backend/aulafy-api-nest      NestJS monolito modular — API REST
database/mysql               MySQL 8 — base de datos relacional
```

**Justificación:**
- El MVP requiere simplicidad operativa y trazabilidad clara para entrega académica.
- Un monolito modular permite separación de responsabilidades por dominio sin la complejidad operativa de microservicios.
- El costo de infraestructura AWS se mantiene controlado con un único proceso backend en Elastic Beanstalk.

**Módulos del backend por dominio:**
`auth`, `users`, `courses`, `subjects`, `academic`, `attendance`, `annotations`, `chat`, `calendar`, `feed`, `risk`, `notifications`, `common/access`

---

## 6. No se usan microservicios

**Decisión:** El proyecto no declara ni implementa microservicios en ninguna de sus versiones académicas.

**Justificación técnica:**
- Un monolito modular NestJS ya provee separación de módulos, inyección de dependencias e interfaces claras entre dominios.
- Los microservicios requieren orquestación, service discovery, comunicación entre procesos (gRPC, mensajería) y estrategias de consistencia eventual que exceden el alcance académico.
- AWS Elastic Beanstalk despliega un único proceso Node.js bajo un entorno controlado. No hay API Gateway con múltiples servicios detrás.

**Aclaración para revisión académica:**
Cuando el proyecto describe "backend NestJS con módulos por dominio", se refiere a una organización modular dentro de un único proceso. No son servicios independientes con bases de datos separadas ni comunicación por red entre ellos.

---

*Documento generado para la entrega Semana 8 del proyecto Aulafy.*
