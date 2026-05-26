package cl.aulafy.api.attendance.dto;

import cl.aulafy.api.attendance.entity.Attendance;
import cl.aulafy.api.attendance.entity.AttendanceStatus;

import java.time.LocalDate;

public record AttendanceResponse(
        Long id,
        Long studentId,
        String studentName,
        Long courseId,
        String courseName,
        LocalDate date,
        AttendanceStatus status,
        String comment
) {
    public static AttendanceResponse from(Attendance attendance) {
        return new AttendanceResponse(
                attendance.getId(),
                attendance.getStudent().getId(),
                attendance.getStudent().getFullName(),
                attendance.getCourse().getId(),
                attendance.getCourse().getName(),
                attendance.getDate(),
                attendance.getStatus(),
                attendance.getComment()
        );
    }
}
