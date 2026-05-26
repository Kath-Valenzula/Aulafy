package cl.aulafy.api.users.dto;

import cl.aulafy.api.users.entity.RoleName;
import cl.aulafy.api.users.entity.User;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        RoleName role,
        boolean active,
        String telegramChatId,
        LocalDateTime createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.isActive(),
                user.getTelegramChatId(),
                user.getCreatedAt()
        );
    }
}
