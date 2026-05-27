package cl.aulafy.api.courses.service;

import cl.aulafy.api.common.exception.BusinessException;
import cl.aulafy.api.common.exception.ResourceNotFoundException;
import cl.aulafy.api.common.security.AccessControlService;
import cl.aulafy.api.courses.dto.CourseRequest;
import cl.aulafy.api.courses.dto.CourseResponse;
import cl.aulafy.api.courses.entity.Course;
import cl.aulafy.api.courses.repository.CourseRepository;
import cl.aulafy.api.users.entity.RoleName;
import cl.aulafy.api.users.entity.User;
import cl.aulafy.api.users.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserService userService;
    private final AccessControlService accessControlService;

    public CourseService(CourseRepository courseRepository, UserService userService,
                         AccessControlService accessControlService) {
        this.courseRepository = courseRepository;
        this.userService = userService;
        this.accessControlService = accessControlService;
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> findAll() {
        return courseRepository.findByActiveTrueOrderByNameAsc()
                .stream()
                .map(CourseResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> findVisible(User user) {
        if (user.getRole() == RoleName.ADMIN || user.getRole() == RoleName.COLEGIO) {
            return findAll();
        }
        List<Course> courses = switch (user.getRole()) {
            case PROFESOR -> courseRepository.findActiveByTeacherId(user.getId());
            case ESTUDIANTE -> courseRepository.findActiveByStudentId(user.getId());
            case APODERADO -> courseRepository.findActiveByGuardianId(user.getId());
            default -> List.of();
        };
        return courses.stream().map(CourseResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public CourseResponse findById(Long id, User user) {
        Course course = getById(id);
        accessControlService.assertCanViewCourse(user, course);
        return CourseResponse.from(course);
    }

    @Transactional
    public CourseResponse create(CourseRequest request) {
        Course course = new Course(
                request.name().trim(),
                request.level().trim(),
                request.section().trim(),
                request.schoolName().trim()
        );
        return CourseResponse.from(courseRepository.save(course));
    }

    @Transactional
    public CourseResponse update(Long id, CourseRequest request) {
        Course course = getById(id);
        course.setName(request.name().trim());
        course.setLevel(request.level().trim());
        course.setSection(request.section().trim());
        course.setSchoolName(request.schoolName().trim());
        return CourseResponse.from(course);
    }

    @Transactional
    public CourseResponse addStudent(Long courseId, Long studentId) {
        Course course = getById(courseId);
        User student = userService.getById(studentId);
        if (student.getRole() != RoleName.ESTUDIANTE) {
            throw new BusinessException("El usuario seleccionado no tiene rol ESTUDIANTE");
        }
        course.getStudents().add(student);
        return CourseResponse.from(course);
    }

    @Transactional
    public CourseResponse addTeacher(Long courseId, Long teacherId) {
        Course course = getById(courseId);
        User teacher = userService.getById(teacherId);
        if (teacher.getRole() != RoleName.PROFESOR) {
            throw new BusinessException("El usuario seleccionado no tiene rol PROFESOR");
        }
        course.getTeachers().add(teacher);
        return CourseResponse.from(course);
    }

    @Transactional(readOnly = true)
    public Course getById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso", id));
    }
}
