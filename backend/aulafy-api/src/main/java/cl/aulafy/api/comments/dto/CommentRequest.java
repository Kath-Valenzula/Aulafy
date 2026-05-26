package cl.aulafy.api.comments.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentRequest(
        @NotBlank(message = "El comentario no puede estar vacio")
        @Size(max = 600, message = "El comentario no puede superar 600 caracteres")
        String content
) {
}
