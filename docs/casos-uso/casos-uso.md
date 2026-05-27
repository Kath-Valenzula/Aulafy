# Casos de uso

## CU-01 Iniciar sesion

Actor: usuario registrado.

Flujo:
1. Ingresa correo y contrasena.
2. La API valida credenciales.
3. La API entrega JWT y datos del usuario.
4. El frontend redirige al dashboard.

Resultado: sesion activa con permisos segun rol.

## CU-02 Publicar aviso

Actor: admin, colegio o profesor.

Flujo:
1. Selecciona curso.
2. Completa titulo, contenido, tipo y estado de comentarios.
3. La API valida rol y pertenencia al curso.
4. La publicacion queda visible en el muro.

Resultado: aviso ordenado por fijadas y fecha.

## CU-03 Comentar publicacion

Actor: estudiante o apoderado con acceso al curso.

Flujo:
1. Abre publicacion.
2. Escribe comentario.
3. La API valida acceso y comentarios habilitados.
4. El comentario queda asociado a la publicacion.

Resultado: comunicacion trazable.

## CU-04 Crear evento academico

Actor: admin, colegio o profesor.

Flujo:
1. Selecciona curso.
2. Registra tipo, fecha, descripcion y opcion Telegram.
3. La API valida permisos.
4. El evento queda en calendario.

Resultado: evento visible para usuarios asociados.

## CU-05 Consultar notas

Actor: estudiante, apoderado, profesor, colegio o admin.

Flujo:
1. Solicita notas de un estudiante.
2. La API valida identidad, vinculo o pertenencia.
3. La API retorna notas y resumen academico.

Resultado: promedio parcial claro, sin datos falsos.

## CU-06 Consultar asistencia

Actor: estudiante, apoderado, profesor, colegio o admin.

Flujo:
1. Solicita registros de asistencia.
2. La API valida acceso al estudiante.
3. La API calcula porcentaje y estado.

Resultado: asistencia visible y defendible.
