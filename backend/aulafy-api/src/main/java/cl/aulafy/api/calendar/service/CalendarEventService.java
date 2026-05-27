package cl.aulafy.api.calendar.service;

import cl.aulafy.api.calendar.dto.CalendarEventRequest;
import cl.aulafy.api.calendar.dto.CalendarEventResponse;
import cl.aulafy.api.calendar.entity.CalendarEvent;
import cl.aulafy.api.calendar.repository.CalendarEventRepository;
import cl.aulafy.api.common.exception.ResourceNotFoundException;
import cl.aulafy.api.common.security.AccessControlService;
import cl.aulafy.api.courses.entity.Course;
import cl.aulafy.api.courses.service.CourseService;
import cl.aulafy.api.notifications.telegram.TelegramNotificationService;
import cl.aulafy.api.users.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CalendarEventService {

    private final CalendarEventRepository calendarEventRepository;
    private final CourseService courseService;
    private final TelegramNotificationService telegramNotificationService;
    private final AccessControlService accessControlService;

    public CalendarEventService(CalendarEventRepository calendarEventRepository, CourseService courseService,
                                TelegramNotificationService telegramNotificationService,
                                AccessControlService accessControlService) {
        this.calendarEventRepository = calendarEventRepository;
        this.courseService = courseService;
        this.telegramNotificationService = telegramNotificationService;
        this.accessControlService = accessControlService;
    }

    @Transactional(readOnly = true)
    public List<CalendarEventResponse> findByCourse(Long courseId, User user) {
        accessControlService.assertCanViewCourse(user, courseService.getById(courseId));
        return calendarEventRepository.findByCourseIdAndActiveTrueOrderByStartAtAsc(courseId)
                .stream()
                .map(CalendarEventResponse::from)
                .toList();
    }

    @Transactional
    public CalendarEventResponse create(Long courseId, CalendarEventRequest request, User createdBy) {
        Course course = courseService.getById(courseId);
        accessControlService.assertCanManageCourse(createdBy, course);
        CalendarEvent event = new CalendarEvent(
                course,
                createdBy,
                request.title().trim(),
                request.description().trim(),
                request.type(),
                request.startAt(),
                request.endAt(),
                Boolean.TRUE.equals(request.notifyTelegram())
        );
        CalendarEvent saved = calendarEventRepository.save(event);
        if (saved.isNotifyTelegram()) {
            telegramNotificationService.sendConfiguredChat(
                    "Nuevo evento en " + course.getName() + ": " + saved.getTitle() + " - " + saved.getStartAt()
            );
        }
        return CalendarEventResponse.from(saved);
    }

    @Transactional
    public CalendarEventResponse update(Long id, CalendarEventRequest request, User user) {
        CalendarEvent event = getById(id);
        accessControlService.assertCanManageCourse(user, event.getCourse());
        event.setTitle(request.title().trim());
        event.setDescription(request.description().trim());
        event.setType(request.type());
        event.setStartAt(request.startAt());
        event.setEndAt(request.endAt());
        event.setNotifyTelegram(Boolean.TRUE.equals(request.notifyTelegram()));
        return CalendarEventResponse.from(event);
    }

    @Transactional
    public void delete(Long id, User user) {
        CalendarEvent event = getById(id);
        accessControlService.assertCanManageCourse(user, event.getCourse());
        event.setActive(false);
    }

    @Transactional(readOnly = true)
    public CalendarEvent getById(Long id) {
        return calendarEventRepository.findById(id)
                .filter(CalendarEvent::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Evento", id));
    }
}
