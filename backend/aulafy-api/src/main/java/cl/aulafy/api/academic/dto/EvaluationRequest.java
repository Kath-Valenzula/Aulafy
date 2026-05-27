package cl.aulafy.api.academic.dto;

import cl.aulafy.api.academic.entity.EvaluationType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record EvaluationRequest(
        @NotNull(message = "El curso es obligatorio")
        Long courseId,

        @NotNull(message = "La asignatura es obligatoria")
        Long subjectId,

        @NotBlank(message = "El titulo es obligatorio")
        @Size(max = 160, message = "El titulo no puede superar 160 caracteres")
        String title,

        @NotBlank(message = "La descripcion es obligatoria")
        String description,

        @NotNull(message = "El tipo de evaluacion es obligatorio")
        EvaluationType type,

        @NotNull(message = "La fecha de evaluacion es obligatoria")
        LocalDate evaluationDate,

        @Min(value = 1, message = "La ponderacion minima es 1")
        @Max(value = 100, message = "La ponderacion maxima es 100")
        Integer weight,

        Boolean active
) {
}
