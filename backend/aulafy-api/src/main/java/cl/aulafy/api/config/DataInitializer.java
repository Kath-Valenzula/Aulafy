package cl.aulafy.api.config;

import cl.aulafy.api.academic.entity.Evaluation;
import cl.aulafy.api.academic.entity.EvaluationType;
import cl.aulafy.api.academic.entity.Grade;
import cl.aulafy.api.academic.repository.EvaluationRepository;
import cl.aulafy.api.academic.repository.GradeRepository;
import cl.aulafy.api.attendance.entity.Attendance;
import cl.aulafy.api.attendance.entity.AttendanceStatus;
import cl.aulafy.api.attendance.repository.AttendanceRepository;
import cl.aulafy.api.calendar.entity.CalendarEvent;
import cl.aulafy.api.calendar.entity.EventType;
import cl.aulafy.api.calendar.repository.CalendarEventRepository;
import cl.aulafy.api.comments.entity.Comment;
import cl.aulafy.api.comments.repository.CommentRepository;
import cl.aulafy.api.courses.entity.Course;
import cl.aulafy.api.courses.entity.GuardianStudent;
import cl.aulafy.api.courses.entity.StudentProfile;
import cl.aulafy.api.courses.entity.Subject;
import cl.aulafy.api.courses.repository.CourseRepository;
import cl.aulafy.api.courses.repository.GuardianStudentRepository;
import cl.aulafy.api.courses.repository.StudentProfileRepository;
import cl.aulafy.api.courses.repository.SubjectRepository;
import cl.aulafy.api.posts.entity.Post;
import cl.aulafy.api.posts.entity.PostType;
import cl.aulafy.api.posts.repository.PostRepository;
import cl.aulafy.api.users.entity.RoleName;
import cl.aulafy.api.users.entity.User;
import cl.aulafy.api.users.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedDemoData(
            UserRepository userRepository,
            CourseRepository courseRepository,
            SubjectRepository subjectRepository,
            StudentProfileRepository studentProfileRepository,
            GuardianStudentRepository guardianStudentRepository,
            PostRepository postRepository,
            CommentRepository commentRepository,
            CalendarEventRepository calendarEventRepository,
            EvaluationRepository evaluationRepository,
            GradeRepository gradeRepository,
            AttendanceRepository attendanceRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            if (userRepository.count() > 0) {
                return;
            }

            userRepository.save(user("Administradora Aulafy", "admin@aulafy.cl", "Admin1234", RoleName.ADMIN, passwordEncoder));
            User colegio = userRepository.save(user("Colegio Demo", "colegio@aulafy.cl", "Colegio1234", RoleName.COLEGIO, passwordEncoder));
            User profesor = userRepository.save(user("Profesor Demo", "profesor@aulafy.cl", "Profesor1234", RoleName.PROFESOR, passwordEncoder));
            User apoderado = userRepository.save(user("Apoderada Demo", "apoderado@aulafy.cl", "Apoderado1234", RoleName.APODERADO, passwordEncoder));
            User estudiante = userRepository.save(user("Estudiante Demo", "estudiante@aulafy.cl", "Estudiante1234", RoleName.ESTUDIANTE, passwordEncoder));

            Course course = courseRepository.save(new Course("6 Basico B", "6 Basico", "B", "Establecimiento Demo Aulafy"));
            course.getTeachers().add(profesor);
            course.getStudents().add(estudiante);
            courseRepository.save(course);

            Subject mathematics = subjectRepository.save(new Subject("Matematica", course, profesor));
            Subject language = subjectRepository.save(new Subject("Lenguaje", course, profesor));
            studentProfileRepository.save(new StudentProfile(estudiante, course, "11.111.111-1", "Apoderada Demo"));
            guardianStudentRepository.save(new GuardianStudent(apoderado, estudiante, "Apoderado titular"));

            Post welcome = postRepository.save(new Post(
                    course,
                    colegio,
                    "Bienvenida a Aulafy",
                    "Este espacio centraliza avisos, tareas y comunicaciones del curso.",
                    PostType.COMUNICADO,
                    true
            ));
            postRepository.save(new Post(
                    course,
                    profesor,
                    "Material para repasar fracciones",
                    "Revisen la guia antes de la clase del viernes.",
                    PostType.MATERIAL,
                    true
            ));
            commentRepository.save(new Comment(welcome, apoderado, "Recibido, muchas gracias."));

            calendarEventRepository.save(new CalendarEvent(
                    course,
                    profesor,
                    "Prueba de fracciones",
                    "Evaluacion parcial de unidad 2.",
                    EventType.PRUEBA,
                    LocalDateTime.now().plusDays(7).withHour(9).withMinute(0),
                    LocalDateTime.now().plusDays(7).withHour(10).withMinute(30),
                    false
            ));
            calendarEventRepository.save(new CalendarEvent(
                    course,
                    colegio,
                    "Reunion de apoderados",
                    "Revision de avances del semestre.",
                    EventType.REUNION,
                    LocalDateTime.now().plusDays(14).withHour(18).withMinute(30),
                    LocalDateTime.now().plusDays(14).withHour(19).withMinute(30),
                    false
            ));

            Evaluation evaluation = evaluationRepository.save(new Evaluation(
                    course,
                    mathematics,
                    "Control de fracciones",
                    "Control parcial de operatoria con fracciones.",
                    EvaluationType.CONTROL,
                    LocalDate.now().minusDays(3),
                    30
            ));
            evaluationRepository.save(new Evaluation(
                    course,
                    language,
                    "Comprension lectora",
                    "Evaluacion de lectura domiciliaria.",
                    EvaluationType.PRUEBA,
                    LocalDate.now().plusDays(10),
                    20
            ));
            gradeRepository.save(new Grade(estudiante, evaluation, BigDecimal.valueOf(6.4), BigDecimal.valueOf(7), "Buen desempeno"));
            attendanceRepository.saveAll(List.of(
                    new Attendance(estudiante, course, LocalDate.now().minusDays(4), AttendanceStatus.PRESENTE, null),
                    new Attendance(estudiante, course, LocalDate.now().minusDays(3), AttendanceStatus.ATRASADO, "Ingreso 10 minutos tarde"),
                    new Attendance(estudiante, course, LocalDate.now().minusDays(2), AttendanceStatus.PRESENTE, null),
                    new Attendance(estudiante, course, LocalDate.now().minusDays(1), AttendanceStatus.JUSTIFICADO, "Certificado medico")
            ));
        };
    }

    private User user(String fullName, String email, String password, RoleName role, PasswordEncoder passwordEncoder) {
        return new User(fullName, email, passwordEncoder.encode(password), role, null);
    }
}
