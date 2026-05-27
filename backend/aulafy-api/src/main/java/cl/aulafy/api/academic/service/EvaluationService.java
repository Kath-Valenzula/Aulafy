package cl.aulafy.api.academic.service;

import cl.aulafy.api.academic.dto.EvaluationRequest;
import cl.aulafy.api.academic.dto.EvaluationResponse;
import cl.aulafy.api.academic.entity.Evaluation;
import cl.aulafy.api.academic.repository.EvaluationRepository;
import cl.aulafy.api.common.exception.BusinessException;
import cl.aulafy.api.common.exception.ResourceNotFoundException;
import cl.aulafy.api.common.security.AccessControlService;
import cl.aulafy.api.courses.entity.Course;
import cl.aulafy.api.courses.entity.Subject;
import cl.aulafy.api.courses.service.CourseService;
import cl.aulafy.api.courses.service.SubjectService;
import cl.aulafy.api.users.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final CourseService courseService;
    private final SubjectService subjectService;
    private final AccessControlService accessControlService;

    public EvaluationService(EvaluationRepository evaluationRepository, CourseService courseService,
                             SubjectService subjectService, AccessControlService accessControlService) {
        this.evaluationRepository = evaluationRepository;
        this.courseService = courseService;
        this.subjectService = subjectService;
        this.accessControlService = accessControlService;
    }

    @Transactional(readOnly = true)
    public List<EvaluationResponse> findByCourse(Long courseId, User user) {
        accessControlService.assertCanViewCourse(user, courseService.getById(courseId));
        return evaluationRepository.findByCourseIdAndActiveTrueOrderByEvaluationDateAsc(courseId)
                .stream()
                .map(EvaluationResponse::from)
                .toList();
    }

    @Transactional
    public EvaluationResponse create(EvaluationRequest request, User user) {
        Course course = courseService.getById(request.courseId());
        Subject subject = subjectService.getById(request.subjectId());
        validateSubjectCourse(subject, course);
        accessControlService.assertCanManageCourse(user, course);
        Evaluation evaluation = new Evaluation(
                course,
                subject,
                request.title().trim(),
                request.description().trim(),
                request.type(),
                request.evaluationDate(),
                request.weight()
        );
        evaluation.setActive(request.active() == null || request.active());
        return EvaluationResponse.from(evaluationRepository.save(evaluation));
    }

    @Transactional
    public EvaluationResponse update(Long id, EvaluationRequest request, User user) {
        Evaluation evaluation = getById(id);
        Course course = courseService.getById(request.courseId());
        Subject subject = subjectService.getById(request.subjectId());
        validateSubjectCourse(subject, course);
        accessControlService.assertCanManageCourse(user, evaluation.getCourse());
        accessControlService.assertCanManageCourse(user, course);
        evaluation.setCourse(course);
        evaluation.setSubject(subject);
        evaluation.setTitle(request.title().trim());
        evaluation.setDescription(request.description().trim());
        evaluation.setType(request.type());
        evaluation.setEvaluationDate(request.evaluationDate());
        evaluation.setWeight(request.weight());
        evaluation.setActive(request.active() == null || request.active());
        return EvaluationResponse.from(evaluation);
    }

    @Transactional(readOnly = true)
    public Evaluation getById(Long id) {
        return evaluationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluacion", id));
    }

    private void validateSubjectCourse(Subject subject, Course course) {
        if (!subject.getCourse().getId().equals(course.getId())) {
            throw new BusinessException("La asignatura no pertenece al curso indicado");
        }
    }
}
