INSERT INTO users (id, full_name, email, password_hash, role, active, created_at) VALUES
(1, 'Administradora Aulafy', 'admin@aulafy.cl', '$2a$10$2bea8VDQOkSSFKlcUL3KluHssusdvfaNJbEeFBnt9besKxU6mkYdK', 'ADMIN', 1, CURRENT_TIMESTAMP),
(2, 'Colegio Demo', 'colegio@aulafy.cl', '$2a$10$5tydhoHfydH.t2/ds7wXGOHSngMtblC91bum1FCRb47bx9bcHeE0m', 'COLEGIO', 1, CURRENT_TIMESTAMP),
(3, 'Profesor Demo', 'profesor@aulafy.cl', '$2a$10$17b8egEoDof/ZYcVK8BG5etZkcK5RN3xucNm8vfuWfmv1f00qnrgG', 'PROFESOR', 1, CURRENT_TIMESTAMP),
(4, 'Apoderada Demo', 'apoderado@aulafy.cl', '$2a$10$Z7rLdPztJpuyNEje2LFhd.v9QPn3tNsRZpdGB4OFscs//pK7CzTpu', 'APODERADO', 1, CURRENT_TIMESTAMP),
(5, 'Estudiante Demo', 'estudiante@aulafy.cl', '$2a$10$TSVgNzZPXQXIACYTAE0MIuY7QV1Ea987EJyR1zzS1wnHRG9zvHpKi', 'ESTUDIANTE', 1, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE email = VALUES(email);

INSERT INTO levels (id, name, sort_order, active)
VALUES
  (1, '1ro Basico', 3, 1),
  (2, '2do Basico', 4, 1),
  (3, '3ro Basico', 5, 1),
  (4, '4to Basico', 6, 1),
  (5, '5to Basico', 7, 1),
  (6, '6to Basico', 8, 1),
  (7, '7mo Basico', 9, 1),
  (8, '8vo Basico', 10, 1),
  (9, '1ro Medio', 11, 1),
  (10, '2do Medio', 12, 1),
  (11, '3ro Medio', 13, 1),
  (12, '4to Medio', 14, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  sort_order = VALUES(sort_order),
  active = VALUES(active);

INSERT INTO cycles (id, name, description, active)
VALUES
  (1, 'Primer Ciclo Basico', '1ro a 4to Basico', 1),
  (2, 'Segundo Ciclo Basico', '5to a 8vo Basico', 1),
  (3, 'Ensenanza Media', '1ro a 4to Medio', 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  active = VALUES(active);

INSERT INTO cycle_levels (cycle_id, level_id) VALUES
  (1, 1),
  (1, 2),
  (1, 3),
  (1, 4),
  (2, 5),
  (2, 6),
  (2, 7),
  (2, 8),
  (3, 9),
  (3, 10),
  (3, 11),
  (3, 12)
ON DUPLICATE KEY UPDATE level_id = VALUES(level_id);

INSERT INTO students (id, first_name, last_name, level_id, section, guardian_id, student_user_id, notes, active)
VALUES
  (1, 'Estudiante', 'Demo', 6, 'B', 4, 5, 'Alumno inicial vinculado al modelo academico base.', 1)
ON DUPLICATE KEY UPDATE
  first_name = VALUES(first_name),
  last_name = VALUES(last_name),
  level_id = VALUES(level_id),
  section = VALUES(section),
  guardian_id = VALUES(guardian_id),
  student_user_id = VALUES(student_user_id),
  notes = VALUES(notes),
  active = VALUES(active);

INSERT INTO courses (id, name, level, section, level_id, cycle_id, school_name, active, created_at)
VALUES (1, '6 Basico B', '6 Basico', 'B', 6, 2, 'Establecimiento Demo Aulafy', 1, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  level = VALUES(level),
  section = VALUES(section),
  level_id = VALUES(level_id),
  cycle_id = VALUES(cycle_id);

INSERT INTO course_teachers (course_id, teacher_id) VALUES (1, 3)
ON DUPLICATE KEY UPDATE teacher_id = VALUES(teacher_id);

INSERT INTO course_students (course_id, student_id) VALUES (1, 1)
ON DUPLICATE KEY UPDATE student_id = VALUES(student_id);

INSERT INTO subjects (id, name, course_id, teacher_id, active) VALUES
(1, 'Matematica', 1, 3, 1),
(2, 'Lenguaje', 1, 3, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO evaluations (
  id,
  course_id,
  subject_id,
  title,
  description,
  type,
  evaluation_date,
  weight,
  active
)
VALUES
  (
    1,
    1,
    1,
    'Prueba unidad 1 Matematica',
    'Evaluacion de fracciones, problemas y operatoria basica.',
    'PRUEBA',
    '2026-06-05',
    30,
    1
  ),
  (
    2,
    1,
    2,
    'Control de lectura mensual',
    'Control de comprension lectora y vocabulario contextual.',
    'CONTROL',
    '2026-06-12',
    20,
    1
  )
ON DUPLICATE KEY UPDATE
  course_id = VALUES(course_id),
  subject_id = VALUES(subject_id),
  title = VALUES(title),
  description = VALUES(description),
  type = VALUES(type),
  evaluation_date = VALUES(evaluation_date),
  weight = VALUES(weight),
  active = VALUES(active);

INSERT INTO grades (
  id,
  student_id,
  evaluation_id,
  score,
  max_score,
  observation
)
VALUES
  (
    1,
    1,
    1,
    6.50,
    7.00,
    'Buen dominio de operatoria y resolucion de problemas.'
  ),
  (
    2,
    1,
    2,
    5.80,
    7.00,
    'Debe reforzar inferencias y justificacion de respuestas.'
  )
ON DUPLICATE KEY UPDATE
  student_id = VALUES(student_id),
  evaluation_id = VALUES(evaluation_id),
  score = VALUES(score),
  max_score = VALUES(max_score),
  observation = VALUES(observation);

INSERT INTO attendance (
  id,
  student_id,
  course_id,
  date,
  status,
  comment
)
VALUES
  (
    1,
    1,
    1,
    '2026-06-03',
    'PRESENTE',
    'Asiste a jornada completa.'
  ),
  (
    2,
    1,
    1,
    '2026-06-04',
    'ATRASADO',
    'Ingreso con 10 minutos de retraso.'
  ),
  (
    3,
    1,
    1,
    '2026-06-05',
    'PRESENTE',
    'Participa en evaluacion programada.'
  )
ON DUPLICATE KEY UPDATE
  student_id = VALUES(student_id),
  course_id = VALUES(course_id),
  date = VALUES(date),
  status = VALUES(status),
  comment = VALUES(comment);

INSERT INTO student_profiles (id, user_id, course_id, run, emergency_contact)
VALUES (1, 5, 1, '11.111.111-1', 'Apoderada Demo')
ON DUPLICATE KEY UPDATE emergency_contact = VALUES(emergency_contact);

INSERT INTO guardian_students (id, guardian_id, student_id, relationship)
VALUES (1, 4, 1, 'Apoderado titular')
ON DUPLICATE KEY UPDATE relationship = VALUES(relationship);

INSERT INTO calendar_events (
  id,
  course_id,
  created_by_id,
  title,
  description,
  type,
  start_at,
  end_at,
  notify_telegram,
  active
)
VALUES
  (
    1,
    1,
    3,
    'Prueba de Matematica',
    'Evaluacion parcial de unidad 1.',
    'PRUEBA',
    '2026-06-05 08:00:00',
    '2026-06-05 09:30:00',
    0,
    1
  ),
  (
    2,
    1,
    3,
    'Reunion de apoderados',
    'Reunion general del curso con profesor jefe.',
    'REUNION',
    '2026-06-10 18:00:00',
    '2026-06-10 19:00:00',
    1,
    1
  )
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description),
  type = VALUES(type),
  start_at = VALUES(start_at),
  end_at = VALUES(end_at),
  notify_telegram = VALUES(notify_telegram),
  active = VALUES(active);

INSERT INTO student_annotations (
  id,
  student_id,
  course_id,
  created_by_id,
  type,
  severity,
  status,
  title,
  description,
  active
)
VALUES
  (
    1,
    1,
    1,
    3,
    'CONDUCTUAL',
    'MEDIA',
    'PENDIENTE',
    'Interrupciones en clase',
    'El alumno presenta interrupciones recurrentes durante la explicacion.',
    1
  ),
  (
    2,
    1,
    1,
    3,
    'ACADEMICA',
    'LEVE',
    'LEIDA',
    'Refuerzo en resolucion de problemas',
    'Se recomienda reforzar ejercicios de resolucion de problemas en casa.',
    1
  )
ON DUPLICATE KEY UPDATE
  type = VALUES(type),
  severity = VALUES(severity),
  status = VALUES(status),
  title = VALUES(title),
  description = VALUES(description),
  active = VALUES(active);

INSERT INTO posts (
  id,
  course_id,
  author_id,
  title,
  content,
  type,
  pinned,
  comments_enabled,
  active
)
VALUES
  (
    1,
    1,
    3,
    'Aviso de seguridad vial',
    'Por seguridad, la puerta secundaria permanecera cerrada durante la salida.',
    'AVISO',
    1,
    1,
    1
  ),
  (
    2,
    1,
    3,
    'Nueva tarea de Historia',
    'Revisar material adjunto y completar cuestionario para la proxima clase.',
    'TAREA',
    0,
    1,
    1
  )
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  content = VALUES(content),
  type = VALUES(type),
  pinned = VALUES(pinned),
  comments_enabled = VALUES(comments_enabled),
  active = VALUES(active);

INSERT INTO comments (
  id,
  post_id,
  author_id,
  content,
  active
)
VALUES
  (
    1,
    1,
    4,
    'Gracias por el aviso, estaremos atentos al horario de retiro.',
    1
  ),
  (
    2,
    2,
    5,
    'La entrega es individual o grupal?',
    1
  )
ON DUPLICATE KEY UPDATE
  content = VALUES(content),
  active = VALUES(active);

INSERT INTO chat_rooms (
  id,
  course_id,
  name,
  created_by_id,
  active
)
VALUES
  (
    1,
    1,
    'Chat 6 Basico B',
    3,
    1
  )
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  active = VALUES(active);

INSERT INTO chat_messages (
  id,
  room_id,
  author_id,
  content,
  active
)
VALUES
  (
    1,
    1,
    3,
    'Martin tuvo un excelente desempeno en la prueba de fracciones.',
    1
  ),
  (
    2,
    1,
    4,
    'Muchas gracias por avisarme. Revisare la pauta con el esta tarde.',
    1
  ),
  (
    3,
    1,
    3,
    'No hay tareas extra por hoy. Nos vemos en la reunion de apoderados.',
    1
  )
ON DUPLICATE KEY UPDATE
  content = VALUES(content),
  active = VALUES(active);

INSERT INTO notification_logs (
  id,
  type,
  recipient,
  message,
  status,
  detail
)
VALUES
  (
    1,
    'TELEGRAM_TEST',
    'NOT_CONFIGURED',
    'Mensaje de prueba Aulafy: integracion Telegram operativa.',
    'NOT_CONFIGURED',
    'TELEGRAM_BOT_TOKEN no configurado'
  )
ON DUPLICATE KEY UPDATE
  type = VALUES(type),
  recipient = VALUES(recipient),
  message = VALUES(message),
  status = VALUES(status),
  detail = VALUES(detail);
