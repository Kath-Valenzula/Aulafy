package cl.aulafy.api.notifications.dto;

import jakarta.validation.constraints.NotBlank;

public record TelegramMessageRequest(
        String chatId,

        @NotBlank(message = "El mensaje es obligatorio")
        String message
) {
}
