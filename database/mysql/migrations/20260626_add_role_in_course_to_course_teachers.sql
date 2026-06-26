-- ============================================================================
-- Aulafy | Agregar role_in_course a course_teachers
-- Fecha: 2026-06-26
-- Semana: 8
-- ============================================================================
-- Valores soportados: HEAD_TEACHER, SUBJECT_TEACHER, ASSISTANT
-- Valor por defecto: SUBJECT_TEACHER
-- El profesor demo (user id 3, curso id 1) se actualiza a HEAD_TEACHER.
-- IMPORTANTE: Ejecutar una sola vez sobre bases de datos existentes.
--             En entornos nuevos la columna ya existe via schema.sql.
-- ============================================================================

ALTER TABLE course_teachers
  ADD COLUMN role_in_course VARCHAR(30) NOT NULL DEFAULT 'SUBJECT_TEACHER';

UPDATE course_teachers
  SET role_in_course = 'HEAD_TEACHER'
  WHERE course_id = 1 AND teacher_id = 3;
