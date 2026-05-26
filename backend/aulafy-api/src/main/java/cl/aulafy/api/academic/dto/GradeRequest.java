package cl.aulafy.api.academic.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record GradeRequest(
        @NotNull(message = "El estudiante es obligatorio")
        Long studentId,

        @NotNull(message = "La evaluacion es obligatoria")
        Long evaluationId,

        @NotNull(message = "La nota es obligatoria")
        @DecimalMin(value = "1.0", message = "La nota minima es 1.0")
        @DecimalMax(value = "7.0", message = "La nota maxima es 7.0")
        BigDecimal score,

        @NotNull(message = "La escala maxima es obligatoria")
        BigDecimal maxScore,

        String observation
) {
}
