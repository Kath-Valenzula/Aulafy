package cl.aulafy.api.courses.service;

import cl.aulafy.api.common.exception.BusinessException;
import cl.aulafy.api.common.exception.ResourceNotFoundException;
import cl.aulafy.api.common.security.AccessControlService;
import cl.aulafy.api.courses.dto.SubjectRequest;
import cl.aulafy.api.courses.dto.SubjectResponse;
import cl.aulafy.api.courses.entity.Course;
import cl.aulafy.api.courses.entity.Subject;
import cl.aulafy.api.courses.repository.SubjectRepository;
import cl.aulafy.api.users.entity.RoleName;
import cl.aulafy.api.users.entity.User;
import cl.aulafy.api.users.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final CourseService courseService;
    private final UserService userService;
    private final AccessControlService accessControlService;

    public SubjectService(SubjectRepository subjectRepository, CourseService courseService,
                          UserService userService, AccessControlService accessControlService) {
        this.subjectRepository = subjectRepository;
        this.courseService = courseService;
        this.userService = userService;
        this.accessControlService = accessControlService;
    }

    @Transactional(readOnly = true)
    public List<SubjectResponse> findAll(User user) {
        if (user.getRole() == RoleName.ADMIN || user.getRole() == RoleName.COLEGIO) {
            return subjectRepository.findByActiveTrueOrderByCourseNameAscNameAsc()
                    .stream()
                    .map(SubjectResponse::from)
                    .toList();
        }
        return courseService.findVisible(user).stream()
                .flatMap(course -> subjectRepository.findByCourseIdAndActiveTrueOrderByNameAsc(course.id()).stream())
                .map(SubjectResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SubjectResponse> findByCourse(Long courseId, User user) {
        accessControlService.assertCanViewCourse(user, courseService.getById(courseId));
        return subjectRepository.findByCourseIdAndActiveTrueOrderByNameAsc(courseId)
                .stream()
                .map(SubjectResponse::from)
                .toList();
    }

    @Transactional
    public SubjectResponse create(SubjectRequest request, User user) {
        Course course = courseService.getById(request.courseId());
        accessControlService.assertCanManageCourse(user, course);
        Subject subject = new Subject(request.name().trim(), course, resolveTeacher(request.teacherId()));
        subject.setActive(request.active() == null || request.active());
        return SubjectResponse.from(subjectRepository.save(subject));
    }

    @Transactional
    public SubjectResponse update(Long id, SubjectRequest request, User user) {
        Subject subject = getById(id);
        Course course = courseService.getById(request.courseId());
        accessControlService.assertCanManageCourse(user, course);
        subject.setName(request.name().trim());
        subject.setCourse(course);
        subject.setTeacher(resolveTeacher(request.teacherId()));
        subject.setActive(request.active() == null || request.active());
        return SubjectResponse.from(subject);
    }

    @Transactional(readOnly = true)
    public Subject getById(Long id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asignatura", id));
    }

    private User resolveTeacher(Long teacherId) {
        if (teacherId == null) {
            return null;
        }
        User teacher = userService.getById(teacherId);
        if (teacher.getRole() != RoleName.PROFESOR) {
            throw new BusinessException("El docente asignado debe tener rol PROFESOR");
        }
        return teacher;
    }
}
