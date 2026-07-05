-- ============================================================================
-- Aulafy | Datos demo: Profesor Jefe y Profesor de Asignatura
-- Fecha: 2026-07-05
-- Motor: MySQL 8.x (Amazon RDS)
-- ============================================================================
-- NOTA DE SINTAXIS:
--   Este script usa sintaxis exclusiva de MySQL 8.x:
--     - ON DUPLICATE KEY UPDATE  (no existe en SQL Server)
--     - SELECT col INTO @var     (variables de sesion MySQL)
--     - LIMIT                    (SQL Server usa TOP)
--   El linter del IDE puede reportar errores si esta configurado para SQL Server.
--   Son falsos positivos. El script es valido para MySQL 8.x en Amazon RDS.
-- ============================================================================
-- Objetivo:
--   Crear dos usuarios PROFESOR demo con roles distintos en course_teachers:
--     profesor.jefe@aulafy.cl       → HEAD_TEACHER
--     profesor.asignatura@aulafy.cl → SUBJECT_TEACHER
--
-- Seguridad:
--   - Sin IDs fijos de usuario: resolucion dinamica por email (UNIQUE en users).
--   - Sin ID fijo de curso: resolucion por nombre y establecimiento demo.
--     Si el curso no existe, las FK de course_teachers fallaran de forma
--     explicita — no se asigna silenciosamente a un curso incorrecto.
--   - Sin DELETE ni TRUNCATE.
--   - Sin modificacion de usuarios demo existentes.
--   - Idempotente: re-ejecutable sin duplicados.
--   - Hashes bcryptjs cost 10; compatibles con bcrypt.compare().
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Usuarios demo sin ID fijo
--    email tiene restriccion UNIQUE en users.
--    ON DUPLICATE KEY UPDATE: si el email ya existe, actualiza campos sin
--    cambiar el id auto-asignado por MySQL. Los emails existentes (admin,
--    colegio, profesor, apoderado, estudiante) no se tocan.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO users (full_name, email, password_hash, role, active, created_at)
VALUES (
  'Profesor Jefe Demo',
  'profesor.jefe@aulafy.cl',
  '$2b$10$9TdyY2sWIl/6doc68VZgU.SS3Kc3PaPpAou4NWi4IbHu8YwQtkH3C',
  'PROFESOR',
  1,
  CURRENT_TIMESTAMP
)
ON DUPLICATE KEY UPDATE
  full_name     = VALUES(full_name),
  password_hash = VALUES(password_hash),
  role          = VALUES(role),
  active        = VALUES(active);

INSERT INTO users (full_name, email, password_hash, role, active, created_at)
VALUES (
  'Profesor Asignatura Demo',
  'profesor.asignatura@aulafy.cl',
  '$2b$10$ce8YYSjvq3QUS6ejd/PR0u23z4dzQjdgzBJoZpsBT4xKHsU4XjzD2',
  'PROFESOR',
  1,
  CURRENT_TIMESTAMP
)
ON DUPLICATE KEY UPDATE
  full_name     = VALUES(full_name),
  password_hash = VALUES(password_hash),
  role          = VALUES(role),
  active        = VALUES(active);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Resolver IDs de usuario por email
--    SELECT col INTO @var es sintaxis valida en MySQL fuera de procedimientos.
-- ─────────────────────────────────────────────────────────────────────────────

SELECT id INTO @profesor_jefe_id
FROM users
WHERE email = 'profesor.jefe@aulafy.cl'
LIMIT 1;

SELECT id INTO @profesor_asignatura_id
FROM users
WHERE email = 'profesor.asignatura@aulafy.cl'
LIMIT 1;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Resolver curso demo por nombre y establecimiento
--    El curso "6 Basico B" existe en seed.sql como primer curso del sistema.
--    Si no se encuentra, las FK de course_teachers fallan de forma explicita.
-- ─────────────────────────────────────────────────────────────────────────────

SELECT id INTO @curso_demo_id
FROM courses
WHERE name = '6 Basico B'
  AND school_name = 'Establecimiento Demo Aulafy'
  AND active = 1
LIMIT 1;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Asignar al curso con role_in_course diferenciado
--    PK compuesta (course_id, teacher_id): idempotente por diseno.
--    ON DUPLICATE KEY UPDATE actualiza role_in_course si la relacion ya existe.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO course_teachers (course_id, teacher_id, role_in_course)
VALUES (@curso_demo_id, @profesor_jefe_id, 'HEAD_TEACHER')
ON DUPLICATE KEY UPDATE role_in_course = VALUES(role_in_course);

INSERT INTO course_teachers (course_id, teacher_id, role_in_course)
VALUES (@curso_demo_id, @profesor_asignatura_id, 'SUBJECT_TEACHER')
ON DUPLICATE KEY UPDATE role_in_course = VALUES(role_in_course);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Asignatura demo para Profesor Asignatura
--    subjects no tiene UNIQUE en (name, course_id, teacher_id), por eso
--    se usa WHERE NOT EXISTS para garantizar idempotencia sin ID fijo.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO subjects (name, course_id, teacher_id, active)
SELECT 'Historia', @curso_demo_id, @profesor_asignatura_id, 1
WHERE NOT EXISTS (
  SELECT 1 FROM subjects
  WHERE name       = 'Historia'
    AND course_id  = @curso_demo_id
    AND teacher_id = @profesor_asignatura_id
);

-- ============================================================================
-- VALIDACION (ejecutar despues del script para confirmar resultados)
-- ============================================================================
--
-- 1. Verificar usuarios demo creados (sin asumir ID fijo):
-- SELECT id, full_name, email, role, active
-- FROM users
-- WHERE email IN ('profesor.jefe@aulafy.cl', 'profesor.asignatura@aulafy.cl');
-- Esperado: 2 filas, role = 'PROFESOR', active = 1.
--
-- 2. Verificar curso resuelto:
-- SELECT id, name, school_name
-- FROM courses
-- WHERE name = '6 Basico B' AND school_name = 'Establecimiento Demo Aulafy';
--
-- 3. Verificar asignacion al curso:
-- SELECT ct.course_id, ct.teacher_id, ct.role_in_course, u.full_name, u.email
-- FROM course_teachers ct
-- JOIN users u ON u.id = ct.teacher_id
-- WHERE u.email IN ('profesor.jefe@aulafy.cl', 'profesor.asignatura@aulafy.cl');
-- Esperado: 2 filas con HEAD_TEACHER y SUBJECT_TEACHER.
--
-- 4. Verificar asignatura demo:
-- SELECT s.id, s.name, s.course_id, u.email
-- FROM subjects s
-- JOIN users u ON u.id = s.teacher_id
-- WHERE u.email = 'profesor.asignatura@aulafy.cl';
-- Esperado: 1 fila con name = 'Historia'.
--
-- 5. Confirmar que usuarios demo anteriores NO fueron modificados:
-- SELECT id, full_name, email, role FROM users
-- WHERE email IN (
--   'admin@aulafy.cl', 'colegio@aulafy.cl', 'profesor@aulafy.cl',
--   'apoderado@aulafy.cl', 'estudiante@aulafy.cl'
-- );
-- Esperado: 5 filas sin cambios en id, full_name ni role.
--
-- 6. Verificar hashes (Node.js):
-- const bcrypt = require('bcryptjs');
-- await bcrypt.compare('ProfesorJefe1234',
--   '$2b$10$9TdyY2sWIl/6doc68VZgU.SS3Kc3PaPpAou4NWi4IbHu8YwQtkH3C'); // true
-- await bcrypt.compare('ProfesorAsignatura1234',
--   '$2b$10$ce8YYSjvq3QUS6ejd/PR0u23z4dzQjdgzBJoZpsBT4xKHsU4XjzD2'); // true
-- ============================================================================
