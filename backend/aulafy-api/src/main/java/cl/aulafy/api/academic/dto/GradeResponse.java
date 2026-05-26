package cl.aulafy.api.academic.dto;

import cl.aulafy.api.academic.entity.Grade;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GradeResponse(
        Long id,
        Long studentId,
        String studentName,
        Long evaluationId,
        String evaluationTitle,
        String subjectName,
        LocalDate evaluationDate,
        BigDecimal score,
        BigDecimal maxScore,
        String observation
) {
    public static GradeResponse from(Grade grade) {
        return new GradeResponse(
                grade.getId(),
                grade.getStudent().getId(),
                grade.getStudent().getFullName(),
                grade.getEvaluation().getId(),
                grade.getEvaluation().getTitle(),
                grade.getEvaluation().getSubject().getName(),
                grade.getEvaluation().getEvaluationDate(),
                grade.getScore(),
                grade.getMaxScore(),
                grade.getObservation()
        );
    }
}
