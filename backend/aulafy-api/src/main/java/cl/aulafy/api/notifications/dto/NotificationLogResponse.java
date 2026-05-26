package cl.aulafy.api.notifications.dto;

import cl.aulafy.api.notifications.entity.NotificationLog;
import cl.aulafy.api.notifications.entity.NotificationType;

import java.time.LocalDateTime;

public record NotificationLogResponse(
        Long id,
        NotificationType type,
        String recipient,
        String message,
        String status,
        String detail,
        LocalDateTime createdAt
) {
    public static NotificationLogResponse from(NotificationLog log) {
        return new NotificationLogResponse(
                log.getId(),
                log.getType(),
                log.getRecipient(),
                log.getMessage(),
                log.getStatus(),
                log.getDetail(),
                log.getCreatedAt()
        );
    }
}
