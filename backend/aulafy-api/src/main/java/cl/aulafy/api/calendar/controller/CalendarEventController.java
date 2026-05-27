package cl.aulafy.api.calendar.controller;

import cl.aulafy.api.auth.security.CustomUserDetails;
import cl.aulafy.api.calendar.dto.CalendarEventRequest;
import cl.aulafy.api.calendar.dto.CalendarEventResponse;
import cl.aulafy.api.calendar.service.CalendarEventService;
import cl.aulafy.api.common.response.MessageResponse;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CalendarEventController {

    private final CalendarEventService calendarEventService;

    public CalendarEventController(CalendarEventService calendarEventService) {
        this.calendarEventService = calendarEventService;
    }

    @GetMapping("/courses/{courseId}/events")
    public List<CalendarEventResponse> findByCourse(
            @PathVariable Long courseId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return calendarEventService.findByCourse(courseId, userDetails.getUser());
    }

    @PostMapping("/courses/{courseId}/events")
    @PreAuthorize("hasAnyRole('ADMIN','COLEGIO','PROFESOR')")
    public CalendarEventResponse create(
            @PathVariable Long courseId,
            @Valid @RequestBody CalendarEventRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return calendarEventService.create(courseId, request, userDetails.getUser());
    }

    @PutMapping("/events/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','COLEGIO','PROFESOR')")
    public CalendarEventResponse update(
            @PathVariable Long id,
            @Valid @RequestBody CalendarEventRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return calendarEventService.update(id, request, userDetails.getUser());
    }

    @DeleteMapping("/events/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','COLEGIO','PROFESOR')")
    public MessageResponse delete(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        calendarEventService.delete(id, userDetails.getUser());
        return new MessageResponse("Evento eliminado");
    }
}
