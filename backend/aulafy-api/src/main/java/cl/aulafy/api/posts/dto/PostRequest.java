package cl.aulafy.api.posts.dto;

import cl.aulafy.api.posts.entity.PostType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PostRequest(
        @NotBlank(message = "El titulo es obligatorio")
        @Size(max = 160, message = "El titulo no puede superar 160 caracteres")
        String title,

        @NotBlank(message = "El contenido es obligatorio")
        String content,

        @NotNull(message = "El tipo de publicacion es obligatorio")
        PostType type,

        Boolean commentsEnabled
) {
}
