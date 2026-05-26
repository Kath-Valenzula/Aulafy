INSERT INTO users (id, full_name, email, password_hash, role, active, created_at) VALUES
(1, 'Administradora Aulafy', 'admin@aulafy.cl', '$2a$10$2bea8VDQOkSSFKlcUL3KluHssusdvfaNJbEeFBnt9besKxU6mkYdK', 'ADMIN', TRUE, CURRENT_TIMESTAMP),
(2, 'Colegio Demo', 'colegio@aulafy.cl', '$2a$10$5tydhoHfydH.t2/ds7wXGOHSngMtblC91bum1FCRb47bx9bcHeE0m', 'COLEGIO', TRUE, CURRENT_TIMESTAMP),
(3, 'Profesor Demo', 'profesor@aulafy.cl', '$2a$10$17b8egEoDof/ZYcVK8BG5etZkcK5RN3xucNm8vfuWfmv1f00qnrgG', 'PROFESOR', TRUE, CURRENT_TIMESTAMP),
(4, 'Apoderada Demo', 'apoderado@aulafy.cl', '$2a$10$Z7rLdPztJpuyNEje2LFhd.v9QPn3tNsRZpdGB4OFscs//pK7CzTpu', 'APODERADO', TRUE, CURRENT_TIMESTAMP),
(5, 'Estudiante Demo', 'estudiante@aulafy.cl', '$2a$10$TSVgNzZPXQXIACYTAE0MIuY7QV1Ea987EJyR1zzS1wnHRG9zvHpKi', 'ESTUDIANTE', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

INSERT INTO courses (id, name, level, section, school_name, active, created_at)
VALUES (1, '6 Basico B', '6 Basico', 'B', 'Establecimiento Demo Aulafy', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO course_teachers (course_id, teacher_id) VALUES (1, 3)
ON CONFLICT DO NOTHING;

INSERT INTO course_students (course_id, student_id) VALUES (1, 5)
ON CONFLICT DO NOTHING;

INSERT INTO subjects (id, name, course_id)
VALUES (1, 'Matematica', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO student_profiles (id, user_id, course_id, run, emergency_contact)
VALUES (1, 5, 1, '11.111.111-1', 'Apoderada Demo')
ON CONFLICT (id) DO NOTHING;

INSERT INTO guardian_students (id, guardian_id, student_id, relationship)
VALUES (1, 4, 5, 'Apoderado titular')
ON CONFLICT (id) DO NOTHING;

INSERT INTO posts (id, course_id, author_id, title, content, type, pinned, comments_enabled, active, created_at) VALUES
(1, 1, 2, 'Bienvenida a Aulafy', 'Este espacio centraliza avisos, tareas y comunicaciones del curso.', 'COMUNICADO', TRUE, TRUE, TRUE, CURRENT_TIMESTAMP),
(2, 1, 3, 'Material para repasar fracciones', 'Revisen la guia antes de la clase del viernes.', 'MATERIAL', FALSE, TRUE, TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO comments (id, post_id, author_id, content, active, created_at)
VALUES (1, 1, 4, 'Recibido, muchas gracias.', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO calendar_events (id, course_id, created_by_id, title, description, type, start_at, end_at, notify_telegram, active, created_at) VALUES
(1, 1, 3, 'Prueba de fracciones', 'Evaluacion parcial de unidad 2.', 'PRUEBA', CURRENT_TIMESTAMP + INTERVAL '7 days', CURRENT_TIMESTAMP + INTERVAL '7 days 90 minutes', FALSE, TRUE, CURRENT_TIMESTAMP),
(2, 1, 2, 'Reunion de apoderados', 'Revision de avances del semestre.', 'REUNION', CURRENT_TIMESTAMP + INTERVAL '14 days', CURRENT_TIMESTAMP + INTERVAL '14 days 60 minutes', FALSE, TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO evaluations (id, course_id, subject_id, title, evaluation_date, weight)
VALUES (1, 1, 1, 'Control de fracciones', CURRENT_DATE - INTERVAL '3 days', 30)
ON CONFLICT (id) DO NOTHING;

INSERT INTO grades (id, student_id, evaluation_id, score, max_score, observation, created_at)
VALUES (1, 5, 1, 6.40, 7.00, 'Buen desempeno', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO attendance (id, student_id, course_id, date, status, comment) VALUES
(1, 5, 1, CURRENT_DATE - INTERVAL '4 days', 'PRESENTE', NULL),
(2, 5, 1, CURRENT_DATE - INTERVAL '3 days', 'ATRASADO', 'Ingreso 10 minutos tarde'),
(3, 5, 1, CURRENT_DATE - INTERVAL '2 days', 'PRESENTE', NULL),
(4, 5, 1, CURRENT_DATE - INTERVAL '1 day', 'JUSTIFICADO', 'Certificado medico')
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', GREATEST((SELECT MAX(id) FROM users), 1));
SELECT setval('courses_id_seq', GREATEST((SELECT MAX(id) FROM courses), 1));
SELECT setval('subjects_id_seq', GREATEST((SELECT MAX(id) FROM subjects), 1));
SELECT setval('student_profiles_id_seq', GREATEST((SELECT MAX(id) FROM student_profiles), 1));
SELECT setval('guardian_students_id_seq', GREATEST((SELECT MAX(id) FROM guardian_students), 1));
SELECT setval('posts_id_seq', GREATEST((SELECT MAX(id) FROM posts), 1));
SELECT setval('comments_id_seq', GREATEST((SELECT MAX(id) FROM comments), 1));
SELECT setval('calendar_events_id_seq', GREATEST((SELECT MAX(id) FROM calendar_events), 1));
SELECT setval('evaluations_id_seq', GREATEST((SELECT MAX(id) FROM evaluations), 1));
SELECT setval('grades_id_seq', GREATEST((SELECT MAX(id) FROM grades), 1));
SELECT setval('attendance_id_seq', GREATEST((SELECT MAX(id) FROM attendance), 1));
SELECT setval('notification_logs_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM notification_logs), 1));
