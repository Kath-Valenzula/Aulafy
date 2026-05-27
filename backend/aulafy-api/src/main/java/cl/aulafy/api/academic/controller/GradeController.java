package cl.aulafy.api.academic.controller;

import cl.aulafy.api.auth.security.CustomUserDetails;
import cl.aulafy.api.academic.dto.AcademicSummaryResponse;
import cl.aulafy.api.academic.dto.GradeRequest;
import cl.aulafy.api.academic.dto.GradeResponse;
import cl.aulafy.api.academic.service.GradeService;
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
@RequestMapping("/api")
public class GradeController {

    private final GradeService gradeService;

    public GradeController(GradeService gradeService) {
        this.gradeService = gradeService;
    }

    @GetMapping("/students/{studentId}/grades")
    public List<GradeResponse> findByStudent(
            @PathVariable Long studentId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return gradeService.findByStudent(studentId, userDetails.getUser());
    }

    @PostMapping("/grades")
    @PreAuthorize("hasAnyRole('ADMIN','COLEGIO','PROFESOR')")
    public GradeResponse create(
            @Valid @RequestBody GradeRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return gradeService.create(request, userDetails.getUser());
    }

    @PutMapping("/grades/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','COLEGIO','PROFESOR')")
    public GradeResponse update(
            @PathVariable Long id,
            @Valid @RequestBody GradeRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return gradeService.update(id, request, userDetails.getUser());
    }

    @GetMapping("/students/{studentId}/academic-summary")
    public AcademicSummaryResponse summary(
            @PathVariable Long studentId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return gradeService.summary(studentId, userDetails.getUser());
    }
}
