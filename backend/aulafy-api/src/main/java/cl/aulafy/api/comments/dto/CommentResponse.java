package cl.aulafy.api.comments.dto;

import cl.aulafy.api.comments.entity.Comment;

import java.time.LocalDateTime;

public record CommentResponse(
        Long id,
        Long postId,
        Long authorId,
        String authorName,
        String content,
        LocalDateTime createdAt
) {
    public static CommentResponse from(Comment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getPost().getId(),
                comment.getAuthor().getId(),
                comment.getAuthor().getFullName(),
                comment.getContent(),
                comment.getCreatedAt()
        );
    }
}
