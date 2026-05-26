package cl.aulafy.api.courses.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CourseRequest(
        @NotBlank(message = "El nombre del curso es obligatorio")
        @Size(max = 120, message = "El nombre no puede superar 120 caracteres")
        String name,

        @NotBlank(message = "El nivel es obligatorio")
        String level,

        @NotBlank(message = "La seccion es obligatoria")
        String section,

        @NotBlank(message = "El establecimiento es obligatorio")
        String schoolName
) {
}
