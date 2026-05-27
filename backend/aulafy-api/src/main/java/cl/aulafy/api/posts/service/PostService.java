package cl.aulafy.api.posts.service;

import cl.aulafy.api.common.security.AccessControlService;
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
    private final AccessControlService accessControlService;

    public PostService(PostRepository postRepository, CourseService courseService,
                       AccessControlService accessControlService) {
        this.postRepository = postRepository;
        this.courseService = courseService;
        this.accessControlService = accessControlService;
    }

    @Transactional(readOnly = true)
    public List<PostResponse> findByCourse(Long courseId, User user) {
        accessControlService.assertCanViewCourse(user, courseService.getById(courseId));
        return postRepository.findByCourseIdAndActiveTrueOrderByPinnedDescCreatedAtDesc(courseId)
                .stream()
                .map(PostResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public PostResponse findById(Long id, User user) {
        Post post = getById(id);
        accessControlService.assertCanViewCourse(user, post.getCourse());
        return PostResponse.from(post);
    }

    @Transactional
    public PostResponse create(Long courseId, PostRequest request, User author) {
        Course course = courseService.getById(courseId);
        accessControlService.assertCanManageCourse(author, course);
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
    public PostResponse update(Long id, PostRequest request, User user) {
        Post post = getById(id);
        accessControlService.assertCanManagePost(user, post);
        post.setTitle(request.title().trim());
        post.setContent(request.content().trim());
        post.setType(request.type());
        post.setCommentsEnabled(request.commentsEnabled() == null || request.commentsEnabled());
        return PostResponse.from(post);
    }

    @Transactional
    public void delete(Long id, User user) {
        Post post = getById(id);
        accessControlService.assertCanManagePost(user, post);
        post.setActive(false);
    }

    @Transactional
    public PostResponse togglePin(Long id, User user) {
        Post post = getById(id);
        accessControlService.assertCanManagePost(user, post);
        post.setPinned(!post.isPinned());
        return PostResponse.from(post);
    }

    @Transactional
    public PostResponse toggleComments(Long id, User user) {
        Post post = getById(id);
        accessControlService.assertCanManagePost(user, post);
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
