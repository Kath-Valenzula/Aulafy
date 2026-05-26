package cl.aulafy.api.auth.dto;

import cl.aulafy.api.users.dto.UserResponse;

public record LoginResponse(
        String token,
        String tokenType,
        UserResponse user
) {
}
