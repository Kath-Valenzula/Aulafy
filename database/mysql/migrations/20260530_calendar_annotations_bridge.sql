-- ============================================================================
-- Aulafy | Calendario + Anotaciones (ajuste incremental)
-- Fecha: 2026-05-30
-- ============================================================================

START TRANSACTION;

CREATE TABLE IF NOT EXISTS student_annotations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  created_by_id BIGINT UNSIGNED NOT NULL,
  type VARCHAR(30) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_annotations_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_annotations_course FOREIGN KEY (course_id) REFERENCES courses(id),
  CONSTRAINT fk_annotations_user FOREIGN KEY (created_by_id) REFERENCES users(id)
);

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
    'Prueba de Matemática',
    'Evaluación parcial de unidad 1.',
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
    'Reunión de apoderados',
    'Reunión general del curso con profesor jefe.',
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
    'El alumno presenta interrupciones recurrentes durante la explicación.',
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
    'Refuerzo en resolución de problemas',
    'Se recomienda reforzar ejercicios de resolución de problemas en casa.',
    1
  )
ON DUPLICATE KEY UPDATE
  type = VALUES(type),
  severity = VALUES(severity),
  status = VALUES(status),
  title = VALUES(title),
  description = VALUES(description),
  active = VALUES(active);

COMMIT;
