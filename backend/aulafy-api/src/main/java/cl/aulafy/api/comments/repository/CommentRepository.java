package cl.aulafy.api.comments.repository;

import cl.aulafy.api.comments.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostIdAndActiveTrueOrderByCreatedAtAsc(Long postId);
}
