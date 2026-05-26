package cl.aulafy.api.calendar.dto;

import cl.aulafy.api.calendar.entity.EventType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record CalendarEventRequest(
        @NotBlank(message = "El titulo es obligatorio")
        @Size(max = 160, message = "El titulo no puede superar 160 caracteres")
        String title,

        @NotBlank(message = "La descripcion es obligatoria")
        String description,

        @NotNull(message = "El tipo de evento es obligatorio")
        EventType type,

        @NotNull(message = "La fecha de inicio es obligatoria")
        LocalDateTime startAt,

        LocalDateTime endAt,
        Boolean notifyTelegram
) {
}
