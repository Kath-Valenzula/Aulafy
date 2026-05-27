package cl.aulafy.api.courses.controller;

import cl.aulafy.api.auth.security.CustomUserDetails;
import cl.aulafy.api.courses.dto.SubjectRequest;
import cl.aulafy.api.courses.dto.SubjectResponse;
import cl.aulafy.api.courses.service.SubjectService;
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
public class SubjectController {

    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @GetMapping("/subjects")
    public List<SubjectResponse> findAll(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return subjectService.findAll(userDetails.getUser());
    }

    @GetMapping("/courses/{courseId}/subjects")
    public List<SubjectResponse> findByCourse(
            @PathVariable Long courseId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return subjectService.findByCourse(courseId, userDetails.getUser());
    }

    @PostMapping("/subjects")
    @PreAuthorize("hasAnyRole('ADMIN','COLEGIO','PROFESOR')")
    public SubjectResponse create(
            @Valid @RequestBody SubjectRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return subjectService.create(request, userDetails.getUser());
    }

    @PutMapping("/subjects/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','COLEGIO','PROFESOR')")
    public SubjectResponse update(
            @PathVariable Long id,
            @Valid @RequestBody SubjectRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return subjectService.update(id, request, userDetails.getUser());
    }
}
