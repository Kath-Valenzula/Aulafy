package cl.aulafy.api.academic.service;

import cl.aulafy.api.academic.dto.AcademicSummaryResponse;
import cl.aulafy.api.academic.dto.GradeRequest;
import cl.aulafy.api.academic.dto.GradeResponse;
import cl.aulafy.api.academic.entity.Evaluation;
import cl.aulafy.api.academic.entity.Grade;
import cl.aulafy.api.academic.repository.EvaluationRepository;
import cl.aulafy.api.academic.repository.GradeRepository;
import cl.aulafy.api.common.exception.BusinessException;
import cl.aulafy.api.common.exception.ResourceNotFoundException;
import cl.aulafy.api.common.security.AccessControlService;
import cl.aulafy.api.users.entity.RoleName;
import cl.aulafy.api.users.entity.User;
import cl.aulafy.api.users.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class GradeService {

    private final GradeRepository gradeRepository;
    private final EvaluationRepository evaluationRepository;
    private final UserService userService;
    private final AcademicSummaryService academicSummaryService;
    private final AccessControlService accessControlService;

    public GradeService(GradeRepository gradeRepository, EvaluationRepository evaluationRepository,
                        UserService userService, AcademicSummaryService academicSummaryService,
                        AccessControlService accessControlService) {
        this.gradeRepository = gradeRepository;
        this.evaluationRepository = evaluationRepository;
        this.userService = userService;
        this.academicSummaryService = academicSummaryService;
        this.accessControlService = accessControlService;
    }

    @Transactional(readOnly = true)
    public List<GradeResponse> findByStudent(Long studentId, User user) {
        accessControlService.assertCanViewStudent(user, studentId);
        return gradeRepository.findByStudentIdOrderByEvaluationEvaluationDateDesc(studentId)
                .stream()
                .map(GradeResponse::from)
                .toList();
    }

    @Transactional
    public GradeResponse create(GradeRequest request, User user) {
        User student = getStudent(request.studentId());
        Evaluation evaluation = getEvaluation(request.evaluationId());
        accessControlService.assertCanManageStudentRecord(user, student.getId(), evaluation.getCourse().getId());
        Grade grade = new Grade(
                student,
                evaluation,
                normalizeScore(request.score()),
                normalizeScore(request.maxScore()),
                normalizeObservation(request.observation())
        );
        return GradeResponse.from(gradeRepository.save(grade));
    }

    @Transactional
    public GradeResponse update(Long id, GradeRequest request, User user) {
        Grade grade = gradeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nota", id));
        accessControlService.assertCanManageStudentRecord(
                user,
                grade.getStudent().getId(),
                grade.getEvaluation().getCourse().getId()
        );
        grade.setScore(normalizeScore(request.score()));
        grade.setMaxScore(normalizeScore(request.maxScore()));
        grade.setObservation(normalizeObservation(request.observation()));
        return GradeResponse.from(grade);
    }

    @Transactional(readOnly = true)
    public AcademicSummaryResponse summary(Long studentId, User user) {
        accessControlService.assertCanViewStudent(user, studentId);
        User student = getStudent(studentId);
        List<Grade> grades = gradeRepository.findByStudentIdOrderByEvaluationEvaluationDateDesc(studentId);
        BigDecimal average = academicSummaryService.calculateAverage(grades);
        return new AcademicSummaryResponse(
                student.getId(),
                student.getFullName(),
                grades.size(),
                average,
                academicSummaryService.resolveStatus(average, grades.size()),
                academicSummaryService.resolveMessage(grades.size())
        );
    }

    private User getStudent(Long studentId) {
        User student = userService.getById(studentId);
        if (student.getRole() != RoleName.ESTUDIANTE) {
            throw new BusinessException("El usuario seleccionado no tiene rol ESTUDIANTE");
        }
        return student;
    }

    private Evaluation getEvaluation(Long evaluationId) {
        return evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluacion", evaluationId));
    }

    private BigDecimal normalizeScore(BigDecimal score) {
        return score.setScale(2, java.math.RoundingMode.HALF_UP);
    }

    private String normalizeObservation(String observation) {
        return observation == null || observation.isBlank() ? null : observation.trim();
    }
}
