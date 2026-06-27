-- ============================================================================
-- Aulafy | Datos demo riesgo academico — script incremental
-- Fecha: 2026-06-27
-- Semana: 8
-- ============================================================================
-- PREREQUISITO: Ejecutar primero:
--   20260626_add_role_in_course_to_course_teachers.sql
-- ============================================================================
-- Objetivo:
--   Agrega los 2 estudiantes demo faltantes (Ana Gomez, Carlos Perez)
--   con sus notas y asistencia para que el modulo de riesgo academico
--   muestre resultados reales en AWS/RDS.
-- ============================================================================
-- Tablas afectadas:
--   students          (2 filas nuevas: ids 2, 3)
--   course_students   (2 filas nuevas: curso 1 + estudiantes 2, 3)
--   guardian_students (2 filas nuevas: ids 2, 3)
--   grades            (6 filas: ids 1-2 actualizadas, 3-6 nuevas)
--   attendance        (9 filas nuevas: ids 4-12 para estudiantes 2, 3)
-- ============================================================================
-- Seguridad:
--   - No usa DELETE ni TRUNCATE.
--   - Usa INSERT ... ON DUPLICATE KEY UPDATE en todas las tablas.
--   - grades y attendance no tienen UK en (student_id, eval_id) ni
--     (student_id, course_id, date): se usan IDs fijos como ancla de
--     idempotencia. Si se ejecuta una segunda vez, los valores se
--     actualizan a los mismos datos -> sin efecto colateral.
-- ============================================================================
-- Perfiles de riesgo resultantes:
--   Estudiante Demo (id 1) -> promedio 6.15, asistencia 100% -> sin riesgo
--   Ana Gomez       (id 2) -> promedio 3.35, asistencia 100% -> RIESGO ACADEMICO CRITICO
--   Carlos Perez    (id 3) -> promedio 5.75, asistencia  50% -> RIESGO ASISTENCIA CRITICO
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Estudiantes demo 2 y 3
--    PK: id (BIGINT UNSIGNED AUTO_INCREMENT) → idempotente con IDs fijos
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO students (id, first_name, last_name, level_id, section, guardian_id, student_user_id, notes, active)
VALUES
  (2, 'Ana',    'Gomez', 6, 'B', 4, NULL, 'Alumna demo con riesgo academico por promedio bajo.', 1),
  (3, 'Carlos', 'Perez', 6, 'B', 4, NULL, 'Alumno demo con riesgo de asistencia.',              1)
ON DUPLICATE KEY UPDATE
  first_name      = VALUES(first_name),
  last_name       = VALUES(last_name),
  level_id        = VALUES(level_id),
  section         = VALUES(section),
  guardian_id     = VALUES(guardian_id),
  student_user_id = VALUES(student_user_id),
  notes           = VALUES(notes),
  active          = VALUES(active);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Inscripcion en el curso 1
--    PK compuesta: (course_id, student_id) → idempotente
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO course_students (course_id, student_id)
VALUES (1, 2), (1, 3)
ON DUPLICATE KEY UPDATE student_id = VALUES(student_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Vinculo apoderado-estudiante
--    guardian_students no tiene UK en (guardian_id, student_id).
--    Se usan IDs fijos para anclar idempotencia vía PK.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO guardian_students (id, guardian_id, student_id, relationship)
VALUES
  (2, 4, 2, 'Apoderado titular'),
  (3, 4, 3, 'Apoderado titular')
ON DUPLICATE KEY UPDATE
  guardian_id  = VALUES(guardian_id),
  student_id   = VALUES(student_id),
  relationship = VALUES(relationship);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Notas demo (grades)
--    grades no tiene UK en (student_id, evaluation_id).
--    Se usan IDs fijos para anclar idempotencia vía PK.
--    Evaluaciones existentes: id 1 (Matematica), id 2 (Lenguaje)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO grades (id, student_id, evaluation_id, score, max_score, observation)
VALUES
  -- Estudiante Demo: promedio (6.50 + 5.80) / 2 = 6.15 → sin riesgo
  (1, 1, 1, 6.50, 7.00, 'Buen dominio de operatoria y resolucion de problemas.'),
  (2, 1, 2, 5.80, 7.00, 'Debe reforzar inferencias y justificacion de respuestas.'),
  -- Ana Gomez: promedio (3.20 + 3.50) / 2 = 3.35 → RIESGO ACADEMICO CRITICO (< 3.5)
  (3, 2, 1, 3.20, 7.00, 'Presenta dificultades en operatoria basica. Requiere refuerzo urgente.'),
  (4, 2, 2, 3.50, 7.00, 'Nivel de comprension lectora bajo. Se recomienda apoyo adicional.'),
  -- Carlos Perez: promedio (5.50 + 6.00) / 2 = 5.75 → sin riesgo de notas
  (5, 3, 1, 5.50, 7.00, 'Buen rendimiento cuando asiste a clases.'),
  (6, 3, 2, 6.00, 7.00, 'Comprension lectora en nivel esperado para el curso.')
ON DUPLICATE KEY UPDATE
  student_id    = VALUES(student_id),
  evaluation_id = VALUES(evaluation_id),
  score         = VALUES(score),
  max_score     = VALUES(max_score),
  observation   = VALUES(observation);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Asistencia demo (attendance)
--    attendance no tiene UK en (student_id, course_id, date).
--    Se usan IDs fijos para anclar idempotencia vía PK.
--    Asistencia ids 1-3 (Estudiante Demo) ya existen en RDS → no se tocan.
--    Se agregan ids 4-6 (Ana Gomez: 100%) y ids 7-12 (Carlos Perez: 50%).
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO attendance (id, student_id, course_id, date, status, comment)
VALUES
  -- Ana Gomez: 3 PRESENTE → asistencia 100% → sin riesgo de asistencia
  (4,  2, 1, '2026-06-03', 'PRESENTE', ''),
  (5,  2, 1, '2026-06-04', 'PRESENTE', ''),
  (6,  2, 1, '2026-06-05', 'PRESENTE', ''),
  -- Carlos Perez: 3 PRESENTE + 3 AUSENTE → asistencia 50% → RIESGO ASISTENCIA CRITICO (< 75%)
  (7,  3, 1, '2026-06-03', 'PRESENTE', ''),
  (8,  3, 1, '2026-06-04', 'AUSENTE',  'Sin justificacion presentada.'),
  (9,  3, 1, '2026-06-05', 'PRESENTE', ''),
  (10, 3, 1, '2026-06-06', 'AUSENTE',  'Sin justificacion presentada.'),
  (11, 3, 1, '2026-06-09', 'PRESENTE', ''),
  (12, 3, 1, '2026-06-10', 'AUSENTE',  'Sin justificacion presentada.')
ON DUPLICATE KEY UPDATE
  student_id = VALUES(student_id),
  course_id  = VALUES(course_id),
  date       = VALUES(date),
  status     = VALUES(status),
  comment    = VALUES(comment);

-- ============================================================================
-- VALIDACION (ejecutar después del script para confirmar)
-- ============================================================================
--
-- 1. Verificar 3 estudiantes activos:
-- SELECT id, first_name, last_name, guardian_id, student_user_id, active
-- FROM students
-- ORDER BY id;
--
-- 2. Verificar inscripcion en el curso 1:
-- SELECT cs.course_id, cs.student_id, s.first_name, s.last_name
-- FROM course_students cs
-- JOIN students s ON s.id = cs.student_id
-- WHERE cs.course_id = 1;
--
-- 3. Verificar notas y promedios:
-- SELECT s.first_name, s.last_name,
--        ROUND(AVG(g.score / g.max_score * 7), 2) AS promedio
-- FROM grades g
-- JOIN students s ON s.id = g.student_id
-- GROUP BY g.student_id, s.first_name, s.last_name;
-- Esperado:
--   Estudiante Demo → ~6.15
--   Ana Gomez       → ~3.35
--   Carlos Perez    → ~5.75
--
-- 4. Verificar asistencia de Carlos Perez (esperado: 50%):
-- SELECT student_id, status, COUNT(*) AS total
-- FROM attendance
-- WHERE student_id = 3 AND course_id = 1
-- GROUP BY student_id, status;
--
-- 5. Verificar vinculos apoderado-estudiante:
-- SELECT gs.id, gs.guardian_id, gs.student_id, gs.relationship,
--        s.first_name, s.last_name
-- FROM guardian_students gs
-- JOIN students s ON s.id = gs.student_id;
-- ============================================================================
