package cl.aulafy.api.posts.service;

import cl.aulafy.api.common.exception.ResourceNotFoundException;
import cl.aulafy.api.courses.entity.Course;
import cl.aulafy.api.courses.service.CourseService;
import cl.aulafy.api.posts.dto.PostRequest;
import cl.aulafy.api.posts.dto.PostResponse;
import cl.aulafy.api.posts.entity.Post;
import cl.aulafy.api.posts.repository.PostRepository;
import cl.aulafy.api.users.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final CourseService courseService;

    public PostService(PostRepository postRepository, CourseService courseService) {
        this.postRepository = postRepository;
        this.courseService = courseService;
    }

    @Transactional(readOnly = true)
    public List<PostResponse> findByCourse(Long courseId) {
        return postRepository.findByCourseIdAndActiveTrueOrderByPinnedDescCreatedAtDesc(courseId)
                .stream()
                .map(PostResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public PostResponse findById(Long id) {
        return PostResponse.from(getById(id));
    }

    @Transactional
    public PostResponse create(Long courseId, PostRequest request, User author) {
        Course course = courseService.getById(courseId);
        Post post = new Post(
                course,
                author,
                request.title().trim(),
                request.content().trim(),
                request.type(),
                request.commentsEnabled() == null || request.commentsEnabled()
        );
        return PostResponse.from(postRepository.save(post));
    }

    @Transactional
    public PostResponse update(Long id, PostRequest request) {
        Post post = getById(id);
        post.setTitle(request.title().trim());
        post.setContent(request.content().trim());
        post.setType(request.type());
        post.setCommentsEnabled(request.commentsEnabled() == null || request.commentsEnabled());
        return PostResponse.from(post);
    }

    @Transactional
    public void delete(Long id) {
        Post post = getById(id);
        post.setActive(false);
    }

    @Transactional
    public PostResponse togglePin(Long id) {
        Post post = getById(id);
        post.setPinned(!post.isPinned());
        return PostResponse.from(post);
    }

    @Transactional
    public PostResponse toggleComments(Long id) {
        Post post = getById(id);
        post.setCommentsEnabled(!post.isCommentsEnabled());
        return PostResponse.from(post);
    }

    @Transactional(readOnly = true)
    public Post getById(Long id) {
        return postRepository.findById(id)
                .filter(Post::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Publicacion", id));
    }
}
