package cl.aulafy.api.users.dto;

import jakarta.validation.constraints.NotNull;

public record UserStatusRequest(
        @NotNull(message = "El estado es obligatorio")
        Boolean active
) {
}
