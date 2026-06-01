-- ============================================================================
-- Aulafy | Notificaciones Telegram (migracion incremental)
-- Fecha: 2026-05-31
-- ============================================================================

START TRANSACTION;

CREATE TABLE IF NOT EXISTS notification_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(30) NOT NULL,
  recipient VARCHAR(120) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(40) NOT NULL,
  detail VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
