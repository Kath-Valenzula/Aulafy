package cl.aulafy.api.attendance.service;

import cl.aulafy.api.attendance.dto.AttendanceRequest;
import cl.aulafy.api.attendance.dto.AttendanceResponse;
import cl.aulafy.api.attendance.dto.AttendanceSummaryResponse;
import cl.aulafy.api.attendance.entity.Attendance;
import cl.aulafy.api.attendance.entity.AttendanceStatus;
import cl.aulafy.api.attendance.repository.AttendanceRepository;
import cl.aulafy.api.common.exception.BusinessException;
import cl.aulafy.api.courses.entity.Course;
import cl.aulafy.api.courses.service.CourseService;
import cl.aulafy.api.users.entity.RoleName;
import cl.aulafy.api.users.entity.User;
import cl.aulafy.api.users.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserService userService;
    private final CourseService courseService;

    public AttendanceService(AttendanceRepository attendanceRepository, UserService userService, CourseService courseService) {
        this.attendanceRepository = attendanceRepository;
        this.userService = userService;
        this.courseService = courseService;
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> findByStudent(Long studentId) {
        return attendanceRepository.findByStudentIdOrderByDateDesc(studentId)
                .stream()
                .map(AttendanceResponse::from)
                .toList();
    }

    @Transactional
    public AttendanceResponse create(AttendanceRequest request) {
        User student = getStudent(request.studentId());
        Course course = courseService.getById(request.courseId());
        Attendance attendance = new Attendance(
                student,
                course,
                request.date(),
                request.status(),
                normalizeComment(request.comment())
        );
        return AttendanceResponse.from(attendanceRepository.save(attendance));
    }

    @Transactional(readOnly = true)
    public AttendanceSummaryResponse summary(Long studentId) {
        User student = getStudent(studentId);
        List<Attendance> records = attendanceRepository.findByStudentIdOrderByDateDesc(studentId);
        long present = count(records, AttendanceStatus.PRESENTE);
        long late = count(records, AttendanceStatus.ATRASADO);
        long absent = count(records, AttendanceStatus.AUSENTE);
        long justified = count(records, AttendanceStatus.JUSTIFICADO);
        BigDecimal percentage = calculateAttendancePercentage(records);
        return new AttendanceSummaryResponse(
                student.getId(),
                student.getFullName(),
                records.size(),
                present,
                absent,
                justified,
                late,
                percentage,
                percentage.compareTo(BigDecimal.valueOf(85)) >= 0 ? "AL_DIA" : "RIESGO"
        );
    }

    public BigDecimal calculateAttendancePercentage(List<Attendance> records) {
        if (records == null || records.isEmpty()) {
            return BigDecimal.ZERO.setScale(2);
        }
        long attended = records.stream()
                .filter(record -> record.getStatus() == AttendanceStatus.PRESENTE || record.getStatus() == AttendanceStatus.ATRASADO)
                .count();
        return BigDecimal.valueOf(attended)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(records.size()), 2, RoundingMode.HALF_UP);
    }

    private User getStudent(Long studentId) {
        User student = userService.getById(studentId);
        if (student.getRole() != RoleName.ESTUDIANTE) {
            throw new BusinessException("El usuario seleccionado no tiene rol ESTUDIANTE");
        }
        return student;
    }

    private long count(List<Attendance> records, AttendanceStatus status) {
        return records.stream().filter(record -> record.getStatus() == status).count();
    }

    private String normalizeComment(String comment) {
        return comment == null || comment.isBlank() ? null : comment.trim();
    }
}
