package cl.aulafy.api.calendar.repository;

import cl.aulafy.api.calendar.entity.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {
    List<CalendarEvent> findByCourseIdAndActiveTrueOrderByStartAtAsc(Long courseId);
}
