package cl.aulafy.api.calendar.dto;

import cl.aulafy.api.calendar.entity.CalendarEvent;
import cl.aulafy.api.calendar.entity.EventType;

import java.time.LocalDateTime;

public record CalendarEventResponse(
        Long id,
        Long courseId,
        String courseName,
        String createdByName,
        String title,
        String description,
        EventType type,
        LocalDateTime startAt,
        LocalDateTime endAt,
        boolean notifyTelegram,
        LocalDateTime createdAt
) {
    public static CalendarEventResponse from(CalendarEvent event) {
        return new CalendarEventResponse(
                event.getId(),
                event.getCourse().getId(),
                event.getCourse().getName(),
                event.getCreatedBy().getFullName(),
                event.getTitle(),
                event.getDescription(),
                event.getType(),
                event.getStartAt(),
                event.getEndAt(),
                event.isNotifyTelegram(),
                event.getCreatedAt()
        );
    }
}
