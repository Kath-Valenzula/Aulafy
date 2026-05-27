package cl.aulafy.api.calendar.service;

import cl.aulafy.api.calendar.dto.CalendarEventRequest;
import cl.aulafy.api.calendar.dto.CalendarEventResponse;
import cl.aulafy.api.calendar.entity.CalendarEvent;
import cl.aulafy.api.calendar.entity.EventType;
import cl.aulafy.api.calendar.repository.CalendarEventRepository;
import cl.aulafy.api.common.security.AccessControlService;
import cl.aulafy.api.courses.entity.Course;
import cl.aulafy.api.courses.service.CourseService;
import cl.aulafy.api.notifications.telegram.TelegramNotificationService;
import cl.aulafy.api.users.entity.RoleName;
import cl.aulafy.api.users.entity.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CalendarEventServiceTest {

    @Mock
    private CalendarEventRepository calendarEventRepository;

    @Mock
    private CourseService courseService;

    @Mock
    private TelegramNotificationService telegramNotificationService;

    @Mock
    private AccessControlService accessControlService;

    @InjectMocks
    private CalendarEventService calendarEventService;

    @Test
    void createStoresEventWithoutTelegramWhenNotifyIsFalse() {
        Course course = new Course("6 Basico B", "6 Basico", "B", "Establecimiento Demo Aulafy");
        course.setId(1L);
        User author = new User("Profesor Demo", "profesor@aulafy.cl", "hash", RoleName.PROFESOR, null);
        author.setId(3L);
        LocalDateTime startAt = LocalDateTime.of(2026, 6, 10, 9, 0);

        when(courseService.getById(1L)).thenReturn(course);
        when(calendarEventRepository.save(any(CalendarEvent.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CalendarEventResponse response = calendarEventService.create(
                1L,
                new CalendarEventRequest("Prueba", "Unidad 2", EventType.PRUEBA, startAt, null, false),
                author
        );

        assertThat(response.title()).isEqualTo("Prueba");
        assertThat(response.type()).isEqualTo(EventType.PRUEBA);
        assertThat(response.notifyTelegram()).isFalse();
        verify(telegramNotificationService, never()).sendConfiguredChat(any());
    }
}
