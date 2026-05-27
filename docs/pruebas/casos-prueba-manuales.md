# Casos de prueba manuales

| ID | Modulo | Precondicion | Pasos | Resultado esperado | Resultado obtenido | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| CP-01 | Login | Backend y frontend activos | Iniciar sesion como admin | Ingresa al dashboard | Pendiente ejecucion manual | Pendiente |
| CP-02 | Login | Usuario demo existente | Usar password incorrecta | Muestra error de credenciales | Pendiente ejecucion manual | Pendiente |
| CP-03 | Seguridad | Login estudiante | Abrir ruta Usuarios | Redirige o bloquea acceso | Pendiente ejecucion manual | Pendiente |
| CP-04 | Muro | Login profesor | Crear publicacion en curso asignado | Publicacion aparece en el feed | Pendiente ejecucion manual | Pendiente |
| CP-05 | Muro | Publicacion con comentarios cerrados | Intentar comentar | Backend rechaza comentario | Pendiente ejecucion manual | Pendiente |
| CP-06 | Calendario | Login profesor | Crear evento de prueba | Evento aparece ordenado por fecha | Pendiente ejecucion manual | Pendiente |
| CP-07 | Notas | Login profesor | Crear evaluacion y nota | Nota aparece y promedio cambia | Pendiente ejecucion manual | Pendiente |
| CP-08 | Asistencia | Login profesor | Registrar asistencia | Resumen recalcula porcentaje | Pendiente ejecucion manual | Pendiente |
| CP-09 | Telegram | Variables vacias | Enviar mensaje de prueba | Resultado `NO_CONFIGURADO` sin error critico | Pendiente ejecucion manual | Pendiente |
| CP-10 | Staging | Recursos autorizados | Abrir `/api/health` en Azure | Responde `UP` | Pendiente recursos | Pendiente |
