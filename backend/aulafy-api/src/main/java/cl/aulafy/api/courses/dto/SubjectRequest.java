package cl.aulafy.api.courses.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SubjectRequest(
        @NotBlank(message = "El nombre de la asignatura es obligatorio")
        @Size(max = 120, message = "El nombre no puede superar 120 caracteres")
        String name,

        @NotNull(message = "El curso es obligatorio")
        Long courseId,

        Long teacherId,
        Boolean active
) {
}
