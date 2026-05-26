package cl.aulafy.api.posts.service;

import cl.aulafy.api.courses.entity.Course;
import cl.aulafy.api.courses.service.CourseService;
import cl.aulafy.api.posts.dto.PostRequest;
import cl.aulafy.api.posts.dto.PostResponse;
import cl.aulafy.api.posts.entity.Post;
import cl.aulafy.api.posts.entity.PostType;
import cl.aulafy.api.posts.repository.PostRepository;
import cl.aulafy.api.users.entity.RoleName;
import cl.aulafy.api.users.entity.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private CourseService courseService;

    @InjectMocks
    private PostService postService;

    @Test
    void createBuildsValidPostForCourse() {
        Course course = new Course("6 Basico B", "6 Basico", "B", "Establecimiento Demo Aulafy");
        course.setId(1L);
        User author = new User("Profesor Demo", "profesor@aulafy.cl", "hash", RoleName.PROFESOR, null);
        author.setId(3L);

        when(courseService.getById(1L)).thenReturn(course);
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PostResponse response = postService.create(
                1L,
                new PostRequest("Tarea semanal", "Resolver ejercicios 1 al 5", PostType.TAREA, true),
                author
        );

        assertThat(response.title()).isEqualTo("Tarea semanal");
        assertThat(response.courseId()).isEqualTo(1L);
        assertThat(response.authorName()).isEqualTo("Profesor Demo");
        assertThat(response.commentsEnabled()).isTrue();
    }
}
