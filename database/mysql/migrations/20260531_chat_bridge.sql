-- ============================================================================
-- Aulafy | Chat interno (migracion incremental)
-- Fecha: 2026-05-31
-- ============================================================================

START TRANSACTION;

CREATE TABLE IF NOT EXISTS chat_rooms (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  created_by_id BIGINT UNSIGNED NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chat_rooms_course FOREIGN KEY (course_id) REFERENCES courses(id),
  CONSTRAINT fk_chat_rooms_user FOREIGN KEY (created_by_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  room_id BIGINT UNSIGNED NOT NULL,
  author_id BIGINT UNSIGNED NOT NULL,
  content TEXT NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chat_messages_room FOREIGN KEY (room_id) REFERENCES chat_rooms(id),
  CONSTRAINT fk_chat_messages_user FOREIGN KEY (author_id) REFERENCES users(id)
);

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
    'Martín tuvo un excelente desempeño en la prueba de fracciones.',
    1
  ),
  (
    2,
    1,
    4,
    '¡Muchas gracias por avisarme! Revisaré la pauta con él esta tarde.',
    1
  ),
  (
    3,
    1,
    3,
    'No hay tareas extra por hoy. Nos vemos en la reunión de apoderados.',
    1
  )
ON DUPLICATE KEY UPDATE
  content = VALUES(content),
  active = VALUES(active);

COMMIT;
