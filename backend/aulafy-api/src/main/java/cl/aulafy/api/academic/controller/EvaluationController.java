package cl.aulafy.api.academic.controller;

import cl.aulafy.api.academic.dto.EvaluationRequest;
import cl.aulafy.api.academic.dto.EvaluationResponse;
import cl.aulafy.api.academic.service.EvaluationService;
import cl.aulafy.api.auth.security.CustomUserDetails;
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
public class EvaluationController {

    private final EvaluationService evaluationService;

    public EvaluationController(EvaluationService evaluationService) {
        this.evaluationService = evaluationService;
    }

    @GetMapping("/courses/{courseId}/evaluations")
    public List<EvaluationResponse> findByCourse(
            @PathVariable Long courseId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return evaluationService.findByCourse(courseId, userDetails.getUser());
    }

    @PostMapping("/evaluations")
    @PreAuthorize("hasAnyRole('ADMIN','COLEGIO','PROFESOR')")
    public EvaluationResponse create(
            @Valid @RequestBody EvaluationRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return evaluationService.create(request, userDetails.getUser());
    }

    @PutMapping("/evaluations/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','COLEGIO','PROFESOR')")
    public EvaluationResponse update(
            @PathVariable Long id,
            @Valid @RequestBody EvaluationRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return evaluationService.update(id, request, userDetails.getUser());
    }
}
