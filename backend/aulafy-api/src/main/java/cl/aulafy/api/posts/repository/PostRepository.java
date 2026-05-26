package cl.aulafy.api.posts.repository;

import cl.aulafy.api.posts.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByCourseIdAndActiveTrueOrderByPinnedDescCreatedAtDesc(Long courseId);
}
