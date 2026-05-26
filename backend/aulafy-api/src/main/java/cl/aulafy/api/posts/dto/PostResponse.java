package cl.aulafy.api.posts.dto;

import cl.aulafy.api.posts.entity.Post;
import cl.aulafy.api.posts.entity.PostType;

import java.time.LocalDateTime;

public record PostResponse(
        Long id,
        Long courseId,
        String courseName,
        Long authorId,
        String authorName,
        String title,
        String content,
        PostType type,
        boolean pinned,
        boolean commentsEnabled,
        LocalDateTime createdAt
) {
    public static PostResponse from(Post post) {
        return new PostResponse(
                post.getId(),
                post.getCourse().getId(),
                post.getCourse().getName(),
                post.getAuthor().getId(),
                post.getAuthor().getFullName(),
                post.getTitle(),
                post.getContent(),
                post.getType(),
                post.isPinned(),
                post.isCommentsEnabled(),
                post.getCreatedAt()
        );
    }
}
