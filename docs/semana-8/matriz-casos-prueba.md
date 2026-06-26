# Matriz de Casos de Prueba — Aulafy MVP

**Proyecto:** Aulafy  
**Semana:** 8  
**Fecha:** 2026-06-26  
**Entorno de revisión:** AWS staging académico  
**URL frontend:** http://aulafy-frontend-803615173905.s3-website.us-east-2.amazonaws.com  
**URL backend health:** http://aulafy-api-staging.eba-uuqbidym.us-east-2.elasticbeanstalk.com/api/health

---

## Credenciales demo

| Usuario | Contraseña |
|---|---|
| admin@aulafy.cl | Admin1234 |
| colegio@aulafy.cl | Colegio1234 |
| profesor@aulafy.cl | Profesor1234 |
| apoderado@aulafy.cl | Apoderado1234 |
| estudiante@aulafy.cl | Estudiante1234 |

---

## CP-01 — Login

| Campo | Detalle |
|---|---|
| **ID** | CP-01 |
| **Módulo** | Login |
| **Rol** | Cualquiera |
| **Precondición** | El entorno AWS está activo |
| **Pasos** | 1. Navegar a la URL del frontend. 2. Ingresar email `admin@aulafy.cl` y contraseña `Admin1234`. 3. Hacer clic en "Ingresar". |
| **Resultado esperado** | Redirige a `/app/dashboard`. Token JWT almacenado en localStorage. |
| **Estado** | Pendiente de ejecución |
| **Evidencia sugerida** | Captura de pantalla del dashboard tras login |

| Campo | Detalle |
|---|---|
| **ID** | CP-02 |
| **Módulo** | Login |
| **Rol** | Cualquiera |
| **Precondición** | El entorno AWS está activo |
| **Pasos** | 1. Navegar a la URL del frontend. 2. Ingresar email válido con contraseña incorrecta. 3. Hacer clic en "Ingresar". |
| **Resultado esperado** | Mensaje de error visible. No hay redirección. No se almacena token. |
| **Estado** | Pendiente de ejecución |
| **Evidencia sugerida** | Captura mostrando el mensaje de error de credenciales |

| Campo | Detalle |
|---|---|
| **ID** | CP-03 |
| **Módulo** | Login |
| **Rol** | Cualquiera |
| **Precondición** | Token JWT expirado o ausente |
| **Pasos** | 1. Navegar directamente a `/app/dashboard`. |
| **Resultado esperado** | Redirige automáticamente a `/login` por el `authGuard`. |
| **Estado** | Pendiente de ejecución |
| **Evidencia sugerida** | Captura de la URL final en `/login` |

---

## CP-04 — Roles y control de acceso

| Campo | Detalle |
|---|---|
| **ID** | CP-04 |
| **Módulo** | Roles / RBAC |
| **Rol** | APODERADO |
| **Precondición** | Sesión activa con `apoderado@aulafy.cl` |
| **Pasos** | 1. Navegar directamente a `/app/risk`. |
| **Resultado esperado** | Redirige a página no autorizada o acceso denegado. La ruta `risk` solo permite ADMIN y COLEGIO. |
| **Estado** | Pendiente de ejecución |
| **Evidencia sugerida** | Captura mostrando redirección o pantalla de error |

| Campo | Detalle |
|---|---|
| **ID** | CP-05 |
| **Módulo** | Roles / RBAC |
| **Rol** | PROFESOR |
| **Precondición** | Sesión activa con `profesor@aulafy.cl` |
| **Pasos** | 1. Verificar que el menú lateral muestra: Dashboard docente, Cursos asignados, Muro académico, Calendario, Evaluaciones y notas, Asistencia, Anotaciones, Mensajes del curso, Notificaciones. |
| **Resultado esperado** | Solo los ítems correspondientes al rol PROFESOR son visibles. No aparece "Reportes y riesgo" ni "Usuarios". |
| **Estado** | Pendiente de ejecución |
| **Evidencia sugerida** | Captura del menú lateral con sesión de PROFESOR |

---

## CP-06 — Dashboard

| Campo | Detalle |
|---|---|
| **ID** | CP-06 |
| **Módulo** | Dashboard |
| **Rol** | ADMIN |
| **Precondición** | Sesión activa con `admin@aulafy.cl` |
| **Pasos** | 1. Navegar a `/app/dashboard`. |
| **Resultado esperado** | Pantalla carga sin error. Muestra accesos directos o resumen de módulos para ADMIN. |
| **Estado** | Pendiente de ejecución |
| **Evidencia sugerida** | Captura del dashboard con sesión de ADMIN |

| Campo | Detalle |
|---|---|
| **ID** | CP-07 |
| **Módulo** | Dashboard |
| **Rol** | APODERADO |
| **Precondición** | Sesión activa con `apoderado@aulafy.cl` |
| **Pasos** | 1. Hacer login. 2. Verificar ruta inicial. |
| **Resultado esperado** | Redirige a `/app/guardian` (home path del rol familia). No va a `/app/dashboard`. |
| **Estado** | Pendiente de ejecución |
| **Evidencia sugerida** | Captura de la URL tras login con APODERADO |

---

## CP-08 — Usuarios

| Campo | Detalle |
|---|---|
| **ID** | CP-08 |
| **Módulo** | Usuarios |
| **Rol** | ADMIN |
| **Precondición** | Sesión activa con `admin@aulafy.cl` |
| **Pasos** | 1. Navegar a `/app/users`. 2. Verificar listado. |
| **Resultado esperado** | Lista de usuarios del sistema visible. Sin errores de carga. |
| **Estado** | Pendiente de ejecución |
| **Evidencia sugerida** | Captura del listado de usuarios |

---

## CP-09 — Cursos

| Campo | Detalle |
|---|---|
| **ID** | CP-09 |
| **Módulo** | Cursos |
| **Rol** | PROFESOR |
| **Precondición** | Sesión activa con `profesor@aulafy.cl`. Profesor vinculado al curso "6 Basico B". |
| **Pasos** | 1. Navegar a `/app/courses`. 2. Verificar cursos listados. |
| **Resultado esperado** | Solo aparecen los cursos asignados al profesor (6 Basico B). No aparecen cursos de otros profesores. |
| **Estado** | Pendiente de ejecución |
| **Evidencia sugerida** | Captura del listado de cursos con sesión de PROFESOR |

| Campo | Detalle |
|---|---|
| **ID** | CP-10 |
| **Módulo** | Cursos |
| **Rol** | ADMIN |
| **Precondición** | Sesión activa con `admin@aulafy.cl` |
| **Pasos** | 1. Navegar a `/app/courses`. |
| **Resultado esperado** | Todos los cursos activos del sistema son visibles. |
| **Estado** | Pendiente de ejecución |
| **Evidencia sugerida** | Captura del listado de cursos con sesión de ADMIN |

---

## CP-11 — Asignaturas

| Campo | Detalle |
|---|---|
| **ID** | CP-11 |
| **Módulo** | Asignaturas |
| **Rol** | ADMIN |
| **Precondición** | Sesión activa con `admin@aulafy.cl` |
| **Pasos** | 1. Navegar a `/app/subjects`. 2. Verificar listado. |
| **Resultado esperado** | Listado de asignaturas visible (Matematica, Lenguaje en demo). |
| **Estado** | Pendiente de ejecución |
| **Evidencia sugerida** | Captura del listado de asignaturas |

---

## CP-12 — Muro / Feed

| Campo | Detalle |
|---|---|
| **ID** | CP-12 |
| **Módulo** | Muro / Feed |
| **Rol** | PROFESOR |
| **Precondición** | Sesión activa con `profesor@aulafy.cl` |
| **Pasos** | 1. Navegar a `/app/feed`. 2. Verificar publicaciones del curso. |
| **Resultado esperado** | Publicaciones del curso 6 Basico B visibles. Posibilidad de agregar comentario. |
| **Estado** | Pendiente de ejecución |
| **Evidencia sugerida** | Captura del muro con publicaciones demo |

| Campo | Detalle |
|---|---|
| **ID** | CP-13 |
| **Módulo** | Muro / Feed |
| **Rol** | APODERADO |
| **Precondición** | Sesión activa con `apoderado@aulafy.cl` |
| **Pasos** | 1. Navegar a `/app/feed`. 2. Verificar publicaciones visibles. |
| **Resultado esperado** | Solo publicaciones del curso vinculado al estudiante del apoderado. |
| **Estado** | Pendiente de ejecución |
| **Evidencia sugerida** | Captura del muro con sesión de APODERADO |

---

## CP-14 — Calendario

| Campo | Detalle |
|---|---|
| **ID** | CP-14 |
| **Módulo** | Calendario |
| **Rol** | PROFESOR |
| **Precondición** | Sesión activa con `profesor@aulafy.cl` |
| **Pasos** | 1. Navegar a `/app/calendar`. 2. Verificar eventos del mes. |
| **Resultado esperado** | Eventos del curso (Prueba de Matematica, Reunion de apoderados) visibles en el calendario. |
| **Estado** | Pendiente de ejecución |
| **Evidencia sugerida** | Captura del calendario con eventos demo |

---

## CP-15 — Notas y evaluaciones

| Campo | Detalle |
|---|---|
| **ID** | CP-15 |
| **Módulo** | Notas / Evaluaciones |
| **Rol** | PROFESOR |
| **Precondición** | Sesión activa con `profesor@aulafy.cl` |
| **Pasos** | 1. Navegar a `/app/academic`. 2. Verificar notas registradas. |
| **Resultado esperado** | Notas de Estudiante Demo visibles: 6.5 (Matematica) y 5.8 (Lenguaje). Promedio calculado. |
| **Estado** | Pendiente de ejecución |
| **Evidencia sugerida** | Captura de la pantalla de notas con al menos un estudiante |

| Campo | Detalle |
|---|---|
| **ID** | CP-16 |
| **Módulo** | Notas / Evaluaciones |
| **Rol** | APODERADO |
| **Precondición** | Sesión activa con `apoderado@aulafy.cl` |
| **Pasos** | 1. Navegar a `/app/academic`. 2. Verificar notas del estudiante vinculado. |
| **Resultado esperado** | Solo notas del estudiante vinculado al apoderado (Estudiante Demo). No se ven notas de otros alumnos. |
| **Estado** | Pendiente de ejecución |
| **Evidencia sugerida** | Captura de notas con sesión de APODERADO |

---

## CP-17 — Asistencia

| Campo | Detalle |
|---|---|
| **ID** | CP-17 |
| **Módulo** | Asistencia |
| **Rol** | PROFESOR |
| **Precondición** | Sesión activa con `profesor@aulafy.cl` |
| **Pasos** | 1. Navegar a `/app/attendance`. 2. Verificar registros del curso. |
| **Resultado esperado** | Registros de asistencia del curso visibles. Estudiante Demo con PRESENTE/ATRASADO. |
| **Estado** | Pendiente de ejecución |
| **Evidencia sugerida** | Captura del módulo de asistencia con registros demo |

---

## CP-18 — Chat / Mensajes del curso

| Campo | Detalle |
|---|---|
| **ID** | CP-18 |
| **Módulo** | Chat / Mensajes del curso |
| **Rol** | PROFESOR |
| **Precondición** | Sesión activa con `profesor@aulafy.cl`. Sala "Chat 6 Basico B" existe en base de datos. |
| **Pasos** | 1. Hacer clic en "Mensajes del curso" en el menú lateral. 2. Verificar que carga la sala. 3. Verificar mensajes existentes. |
| **Resultado esperado** | Sala "Chat 6 Basico B" seleccionada automáticamente. Tres mensajes demo visibles. Formulario de envío activo. |
| **Estado** | Pendiente de ejecución |
| **Evidencia sugerida** | Captura del chat con sala cargada y mensajes visibles |

| Campo | Detalle |
|---|---|
| **ID** | CP-19 |
| **Módulo** | Chat / Mensajes del curso |
| **Rol** | PROFESOR |
| **Precondición** | Sesión activa con `profesor@aulafy.cl`. Sala seleccionada. |
| **Pasos** | 1. Escribir un mensaje en el campo de texto. 2. Hacer clic en el botón de enviar. |
| **Resultado esperado** | Mensaje aparece al final del listado con burbuja propia (alineada a la derecha). |
| **Estado** | Pendiente de ejecución |
| **Evidencia sugerida** | Captura mostrando el nuevo mensaje en la lista |

| Campo | Detalle |
|---|---|
| **ID** | CP-20 |
| **Módulo** | Chat / Mensajes del curso |
| **Rol** | APODERADO |
| **Precondición** | Sesión activa con `apoderado@aulafy.cl` |
| **Pasos** | 1. Hacer clic en "Mensajes del curso" en el menú lateral. 2. Verificar carga de sala y mensajes. |
| **Resultado esperado** | Misma sala visible. Mensajes del profesor aparecen con burbuja ajena (izquierda). Puede responder. |
| **Estado** | Pendiente de ejecución |
| **Evidencia sugerida** | Captura del chat con sesión de APODERADO |

| Campo | Detalle |
|---|---|
| **ID** | CP-21 |
| **Módulo** | Chat / Mensajes del curso |
| **Rol** | APODERADO |
| **Precondición** | Sesión activa con `apoderado@aulafy.cl` |
| **Pasos** | 1. Intentar POST a `/api/chat/rooms` vía Postman o curl con token JWT de APODERADO. |
| **Resultado esperado** | HTTP 403 Forbidden. Solo ADMIN, COLEGIO y PROFESOR pueden crear salas. |
| **Estado** | Pendiente de ejecución |
| **Evidencia sugerida** | Captura de respuesta HTTP 403 en herramienta de API |

---

## CP-22 — Riesgo académico

| Campo | Detalle |
|---|---|
| **ID** | CP-22 |
| **Módulo** | Riesgo académico |
| **Rol** | ADMIN |
| **Precondición** | Sesión activa con `admin@aulafy.cl`. Base de datos inicializada con seed actualizado (3 estudiantes demo). |
| **Pasos** | 1. Navegar a `/app/risk`. 2. Esperar carga del reporte. |
| **Resultado esperado** | Reporte muestra: 2 alumnos en riesgo. Ana Gomez con riesgo ACADEMICO (promedio 3.35, CRITICO). Carlos Perez con riesgo ASISTENCIA (50%, CRITICO). Estudiante Demo sin riesgo. |
| **Estado** | Pendiente de ejecución |
| **Evidencia sugerida** | Captura de la tabla de riesgo con los 2 estudiantes en riesgo |

| Campo | Detalle |
|---|---|
| **ID** | CP-23 |
| **Módulo** | Riesgo académico |
| **Rol** | PROFESOR |
| **Precondición** | Sesión activa con `profesor@aulafy.cl` |
| **Pasos** | 1. Intentar navegar a `/app/risk`. |
| **Resultado esperado** | Redirige o deniega acceso. El módulo solo está disponible para ADMIN y COLEGIO. |
| **Estado** | Pendiente de ejecución |
| **Evidencia sugerida** | Captura mostrando redirección o error de acceso |

| Campo | Detalle |
|---|---|
| **ID** | CP-24 |
| **Módulo** | Riesgo académico |
| **Rol** | COLEGIO |
| **Precondición** | Sesión activa con `colegio@aulafy.cl` |
| **Pasos** | 1. Hacer clic en "Reportes" en el menú lateral. 2. Esperar carga. 3. Verificar umbrales mostrados. |
| **Resultado esperado** | Reporte carga correctamente. Sección de umbrales muestra: promedio < 4 y asistencia < 85%. |
| **Estado** | Pendiente de ejecución |
| **Evidencia sugerida** | Captura de la sección de umbrales en el reporte |

---

## CP-25 — Backend health

| Campo | Detalle |
|---|---|
| **ID** | CP-25 |
| **Módulo** | Backend / Infraestructura |
| **Rol** | N/A |
| **Precondición** | Entorno AWS activo |
| **Pasos** | 1. Navegar a `http://aulafy-api-staging.eba-uuqbidym.us-east-2.elasticbeanstalk.com/api/health` en el navegador. |
| **Resultado esperado** | HTTP 200. Respuesta JSON con `{"status":"ok"}` o similar indicando que el backend está operativo. |
| **Estado** | Pendiente de ejecución |
| **Evidencia sugerida** | Captura de la respuesta JSON en el navegador |

---

## CP-26 — Build frontend

| Campo | Detalle |
|---|---|
| **ID** | CP-26 |
| **Módulo** | Calidad / CI |
| **Rol** | N/A |
| **Precondición** | Node.js instalado. Repositorio clonado. |
| **Pasos** | 1. `cd frontend/aulafy-web` 2. `npm install` 3. `npm run build` |
| **Resultado esperado** | Build completado sin errores. Mensaje "Application bundle generation complete." Artefactos en `dist/aulafy-web`. |
| **Estado** | Ejecutado — Exitoso |
| **Evidencia sugerida** | Salida de consola del comando `npm run build` |

---

## CP-27 — Tests backend

| Campo | Detalle |
|---|---|
| **ID** | CP-27 |
| **Módulo** | Calidad / Testing |
| **Rol** | N/A |
| **Precondición** | Node.js instalado. Repositorio clonado. |
| **Pasos** | 1. `cd backend/aulafy-api-nest` 2. `npm install` 3. `npm test` |
| **Resultado esperado** | 7 suites, 27 tests, todos en estado "passed". Sin suites fallidas. |
| **Estado** | Ejecutado — Exitoso |
| **Evidencia sugerida** | Salida de consola mostrando "Tests: 27 passed, 27 total" |

| Campo | Detalle |
|---|---|
| **ID** | CP-28 |
| **Módulo** | Calidad / Cobertura |
| **Rol** | N/A |
| **Precondición** | Node.js instalado. Repositorio clonado. |
| **Pasos** | 1. `cd backend/aulafy-api-nest` 2. `npm run test:coverage` |
| **Resultado esperado** | Reporte de cobertura generado en `coverage/`. Statements >= 61%, Lines >= 59%, Branches >= 39%, Functions >= 47%. |
| **Estado** | Ejecutado — Exitoso |
| **Evidencia sugerida** | Captura del resumen de cobertura en consola |

---

*Documento generado para la entrega Semana 8 del proyecto Aulafy.*
