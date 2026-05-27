package cl.aulafy.api.academic.dto;

import cl.aulafy.api.academic.entity.Evaluation;
import cl.aulafy.api.academic.entity.EvaluationType;

import java.time.LocalDate;

public record EvaluationResponse(
        Long id,
        Long courseId,
        String courseName,
        Long subjectId,
        String subjectName,
        String title,
        String description,
        EvaluationType type,
        LocalDate evaluationDate,
        Integer weight,
        boolean active
) {
    public static EvaluationResponse from(Evaluation evaluation) {
        return new EvaluationResponse(
                evaluation.getId(),
                evaluation.getCourse().getId(),
                evaluation.getCourse().getName(),
                evaluation.getSubject().getId(),
                evaluation.getSubject().getName(),
                evaluation.getTitle(),
                evaluation.getDescription(),
                evaluation.getType(),
                evaluation.getEvaluationDate(),
                evaluation.getWeight(),
                evaluation.isActive()
        );
    }
}
