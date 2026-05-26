package cl.aulafy.api.attendance.repository;

import cl.aulafy.api.attendance.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentIdOrderByDateDesc(Long studentId);
}
