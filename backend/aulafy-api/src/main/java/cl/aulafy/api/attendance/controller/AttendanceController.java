package cl.aulafy.api.attendance.controller;

import cl.aulafy.api.attendance.dto.AttendanceRequest;
import cl.aulafy.api.attendance.dto.AttendanceResponse;
import cl.aulafy.api.attendance.dto.AttendanceSummaryResponse;
import cl.aulafy.api.attendance.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping("/students/{studentId}/attendance")
    public List<AttendanceResponse> findByStudent(@PathVariable Long studentId) {
        return attendanceService.findByStudent(studentId);
    }

    @PostMapping("/attendance")
    @PreAuthorize("hasAnyRole('ADMIN','COLEGIO','PROFESOR')")
    public AttendanceResponse create(@Valid @RequestBody AttendanceRequest request) {
        return attendanceService.create(request);
    }

    @GetMapping("/students/{studentId}/attendance-summary")
    public AttendanceSummaryResponse summary(@PathVariable Long studentId) {
        return attendanceService.summary(studentId);
    }
}
