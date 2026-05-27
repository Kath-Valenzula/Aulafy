package cl.aulafy.api.courses.controller;

import cl.aulafy.api.auth.security.CustomUserDetails;
import cl.aulafy.api.courses.dto.CourseRequest;
import cl.aulafy.api.courses.dto.CourseResponse;
import cl.aulafy.api.courses.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public List<CourseResponse> findAll(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return courseService.findVisible(userDetails.getUser());
    }

    @GetMapping("/{id}")
    public CourseResponse findById(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return courseService.findById(id, userDetails.getUser());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','COLEGIO')")
    public CourseResponse create(@Valid @RequestBody CourseRequest request) {
        return courseService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','COLEGIO')")
    public CourseResponse update(@PathVariable Long id, @Valid @RequestBody CourseRequest request) {
        return courseService.update(id, request);
    }

    @PostMapping("/{id}/students/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN','COLEGIO')")
    public CourseResponse addStudent(@PathVariable Long id, @PathVariable Long studentId) {
        return courseService.addStudent(id, studentId);
    }

    @PostMapping("/{id}/teachers/{teacherId}")
    @PreAuthorize("hasAnyRole('ADMIN','COLEGIO')")
    public CourseResponse addTeacher(@PathVariable Long id, @PathVariable Long teacherId) {
        return courseService.addTeacher(id, teacherId);
    }
}
