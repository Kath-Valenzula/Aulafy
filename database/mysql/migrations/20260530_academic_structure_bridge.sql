-- ============================================================================
-- Aulafy | Migracion incremental hacia modelo academico base (childsafe)
-- Fecha: 2026-05-30
--
-- Objetivo:
-- - Agregar tablas levels/cycles/cycle_levels/students en una BD legacy ya creada.
-- - Conectar courses con level_id/cycle_id.
-- - Migrar referencias de estudiante desde users -> students para:
--   course_students, guardian_students, grades, attendance.
-- - Mantener datos existentes sin recrear la base.
-- ============================================================================

START TRANSACTION;

-- --------------------------------------------------------------------------
-- 1) Catalogos academicos base
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS levels (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 99,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cycles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cycle_levels (
  cycle_id BIGINT UNSIGNED NOT NULL,
  level_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (cycle_id, level_id),
  CONSTRAINT fk_cycle_levels_cycle FOREIGN KEY (cycle_id) REFERENCES cycles(id),
  CONSTRAINT fk_cycle_levels_level FOREIGN KEY (level_id) REFERENCES levels(id)
);

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

INSERT INTO cycle_levels (cycle_id, level_id)
VALUES
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

-- --------------------------------------------------------------------------
-- 2) Tabla students
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  level_id BIGINT UNSIGNED NOT NULL,
  section VARCHAR(20) NOT NULL,
  guardian_id BIGINT UNSIGNED NULL,
  student_user_id BIGINT UNSIGNED NULL UNIQUE,
  notes VARCHAR(300) NOT NULL DEFAULT '',
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_students_level FOREIGN KEY (level_id) REFERENCES levels(id),
  CONSTRAINT fk_students_guardian FOREIGN KEY (guardian_id) REFERENCES users(id),
  CONSTRAINT fk_students_student_user FOREIGN KEY (student_user_id) REFERENCES users(id)
);

-- Migra usuarios ESTUDIANTE no vinculados aun a students
INSERT INTO students (first_name, last_name, level_id, section, guardian_id, student_user_id, notes, active)
SELECT
  SUBSTRING_INDEX(u.full_name, ' ', 1) AS first_name,
  CASE
    WHEN TRIM(REPLACE(u.full_name, SUBSTRING_INDEX(u.full_name, ' ', 1), '')) = '' THEN SUBSTRING_INDEX(u.full_name, ' ', 1)
    ELSE TRIM(REPLACE(u.full_name, SUBSTRING_INDEX(u.full_name, ' ', 1), ''))
  END AS last_name,
  6 AS level_id,
  'A' AS section,
  (
    SELECT gs.guardian_id
    FROM guardian_students gs
    WHERE gs.student_id = u.id
    LIMIT 1
  ) AS guardian_id,
  u.id AS student_user_id,
  'Migrado desde users' AS notes,
  1 AS active
FROM users u
LEFT JOIN students s ON s.student_user_id = u.id
WHERE u.role = 'ESTUDIANTE' AND s.id IS NULL;

-- --------------------------------------------------------------------------
-- 3) courses: nuevas columnas de referencia academica
-- --------------------------------------------------------------------------
SET @courses_level_column_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'courses'
    AND COLUMN_NAME = 'level_id'
);
SET @sql := IF(
  @courses_level_column_exists = 0,
  'ALTER TABLE courses ADD COLUMN level_id BIGINT UNSIGNED NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @courses_cycle_column_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'courses'
    AND COLUMN_NAME = 'cycle_id'
);
SET @sql := IF(
  @courses_cycle_column_exists = 0,
  'ALTER TABLE courses ADD COLUMN cycle_id BIGINT UNSIGNED NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE courses c
LEFT JOIN levels l ON LOWER(REPLACE(l.name, ' ', '')) = LOWER(REPLACE(c.level, ' ', ''))
SET c.level_id = COALESCE(c.level_id, l.id);

UPDATE courses
SET level_id = 6
WHERE level_id IS NULL;

UPDATE courses c
SET c.cycle_id = (
  SELECT MIN(cl.cycle_id)
  FROM cycle_levels cl
  WHERE cl.level_id = c.level_id
)
WHERE c.cycle_id IS NULL;

SET @fk_courses_level_exists := (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'courses'
    AND CONSTRAINT_NAME = 'fk_courses_level'
);
SET @sql := IF(
  @fk_courses_level_exists = 0,
  'ALTER TABLE courses ADD CONSTRAINT fk_courses_level FOREIGN KEY (level_id) REFERENCES levels(id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_courses_cycle_exists := (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'courses'
    AND CONSTRAINT_NAME = 'fk_courses_cycle'
);
SET @sql := IF(
  @fk_courses_cycle_exists = 0,
  'ALTER TABLE courses ADD CONSTRAINT fk_courses_cycle FOREIGN KEY (cycle_id) REFERENCES cycles(id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- --------------------------------------------------------------------------
-- 4) Migracion de IDs estudiante (users -> students) en tablas relacionales
-- --------------------------------------------------------------------------
UPDATE course_students cs
INNER JOIN students s ON s.student_user_id = cs.student_id
SET cs.student_id = s.id;

UPDATE guardian_students gs
INNER JOIN students s ON s.student_user_id = gs.student_id
SET gs.student_id = s.id;

UPDATE grades g
INNER JOIN students s ON s.student_user_id = g.student_id
SET g.student_id = s.id;

UPDATE attendance a
INNER JOIN students s ON s.student_user_id = a.student_id
SET a.student_id = s.id;

-- --------------------------------------------------------------------------
-- 5) Repoint FKs estudiante hacia students.id
-- --------------------------------------------------------------------------
SET @fk_cs_student_exists := (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'course_students'
    AND CONSTRAINT_NAME = 'fk_course_students_student'
);
SET @sql := IF(
  @fk_cs_student_exists = 1,
  'ALTER TABLE course_students DROP FOREIGN KEY fk_course_students_student',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_cs_student_new_exists := (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'course_students'
    AND CONSTRAINT_NAME = 'fk_course_students_student'
);
SET @sql := IF(
  @fk_cs_student_new_exists = 0,
  'ALTER TABLE course_students ADD CONSTRAINT fk_course_students_student FOREIGN KEY (student_id) REFERENCES students(id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_gs_student_exists := (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'guardian_students'
    AND CONSTRAINT_NAME = 'fk_guardian_students_student'
);
SET @sql := IF(
  @fk_gs_student_exists = 1,
  'ALTER TABLE guardian_students DROP FOREIGN KEY fk_guardian_students_student',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_gs_student_new_exists := (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'guardian_students'
    AND CONSTRAINT_NAME = 'fk_guardian_students_student'
);
SET @sql := IF(
  @fk_gs_student_new_exists = 0,
  'ALTER TABLE guardian_students ADD CONSTRAINT fk_guardian_students_student FOREIGN KEY (student_id) REFERENCES students(id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_grades_student_exists := (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'grades'
    AND CONSTRAINT_NAME = 'fk_grades_student'
);
SET @sql := IF(
  @fk_grades_student_exists = 1,
  'ALTER TABLE grades DROP FOREIGN KEY fk_grades_student',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_grades_student_new_exists := (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'grades'
    AND CONSTRAINT_NAME = 'fk_grades_student'
);
SET @sql := IF(
  @fk_grades_student_new_exists = 0,
  'ALTER TABLE grades ADD CONSTRAINT fk_grades_student FOREIGN KEY (student_id) REFERENCES students(id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_attendance_student_exists := (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'attendance'
    AND CONSTRAINT_NAME = 'fk_attendance_student'
);
SET @sql := IF(
  @fk_attendance_student_exists = 1,
  'ALTER TABLE attendance DROP FOREIGN KEY fk_attendance_student',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_attendance_student_new_exists := (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'attendance'
    AND CONSTRAINT_NAME = 'fk_attendance_student'
);
SET @sql := IF(
  @fk_attendance_student_new_exists = 0,
  'ALTER TABLE attendance ADD CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students(id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

COMMIT;
