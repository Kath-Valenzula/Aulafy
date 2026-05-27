package cl.aulafy.api.comments.controller;

import cl.aulafy.api.auth.security.CustomUserDetails;
import cl.aulafy.api.comments.dto.CommentRequest;
import cl.aulafy.api.comments.dto.CommentResponse;
import cl.aulafy.api.comments.service.CommentService;
import cl.aulafy.api.common.response.MessageResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/posts/{postId}/comments")
    public List<CommentResponse> findByPost(
            @PathVariable Long postId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return commentService.findByPost(postId, userDetails.getUser());
    }

    @PostMapping("/posts/{postId}/comments")
    public CommentResponse create(
            @PathVariable Long postId,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return commentService.create(postId, request, userDetails.getUser());
    }

    @DeleteMapping("/comments/{id}")
    public MessageResponse delete(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        commentService.delete(id, userDetails.getUser());
        return new MessageResponse("Comentario eliminado");
    }
}
