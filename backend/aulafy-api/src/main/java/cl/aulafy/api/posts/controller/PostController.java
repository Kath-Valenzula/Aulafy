package cl.aulafy.api.posts.controller;

import cl.aulafy.api.auth.security.CustomUserDetails;
import cl.aulafy.api.common.response.MessageResponse;
import cl.aulafy.api.posts.dto.PostRequest;
import cl.aulafy.api.posts.dto.PostResponse;
import cl.aulafy.api.posts.service.PostService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping("/courses/{courseId}/posts")
    public List<PostResponse> findByCourse(
            @PathVariable Long courseId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return postService.findByCourse(courseId, userDetails.getUser());
    }

    @PostMapping("/courses/{courseId}/posts")
    @PreAuthorize("hasAnyRole('ADMIN','COLEGIO','PROFESOR')")
    public PostResponse create(
            @PathVariable Long courseId,
            @Valid @RequestBody PostRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return postService.create(courseId, request, userDetails.getUser());
    }

    @GetMapping("/posts/{id}")
    public PostResponse findById(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return postService.findById(id, userDetails.getUser());
    }

    @PutMapping("/posts/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','COLEGIO','PROFESOR')")
    public PostResponse update(
            @PathVariable Long id,
            @Valid @RequestBody PostRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return postService.update(id, request, userDetails.getUser());
    }

    @DeleteMapping("/posts/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','COLEGIO','PROFESOR')")
    public MessageResponse delete(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        postService.delete(id, userDetails.getUser());
        return new MessageResponse("Publicacion eliminada");
    }

    @PatchMapping("/posts/{id}/pin")
    @PreAuthorize("hasAnyRole('ADMIN','COLEGIO','PROFESOR')")
    public PostResponse togglePin(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return postService.togglePin(id, userDetails.getUser());
    }

    @PatchMapping("/posts/{id}/comments-status")
    @PreAuthorize("hasAnyRole('ADMIN','COLEGIO','PROFESOR')")
    public PostResponse toggleComments(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return postService.toggleComments(id, userDetails.getUser());
    }
}
