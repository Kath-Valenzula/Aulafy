package cl.aulafy.api.attendance.dto;

import cl.aulafy.api.attendance.entity.AttendanceStatus;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record AttendanceRequest(
        @NotNull(message = "El estudiante es obligatorio")
        Long studentId,

        @NotNull(message = "El curso es obligatorio")
        Long courseId,

        @NotNull(message = "La fecha es obligatoria")
        LocalDate date,

        @NotNull(message = "El estado es obligatorio")
        AttendanceStatus status,

        String comment
) {
}
