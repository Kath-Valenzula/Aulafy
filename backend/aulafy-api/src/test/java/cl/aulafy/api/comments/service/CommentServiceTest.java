package cl.aulafy.api.comments.service;

import cl.aulafy.api.comments.dto.CommentRequest;
import cl.aulafy.api.comments.repository.CommentRepository;
import cl.aulafy.api.common.exception.BusinessException;
import cl.aulafy.api.common.security.AccessControlService;
import cl.aulafy.api.courses.entity.Course;
import cl.aulafy.api.posts.entity.Post;
import cl.aulafy.api.posts.entity.PostType;
import cl.aulafy.api.posts.service.PostService;
import cl.aulafy.api.users.entity.RoleName;
import cl.aulafy.api.users.entity.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private PostService postService;

    @Mock
    private AccessControlService accessControlService;

    @Test
    void createRejectsCommentWhenPostIsClosed() {
        CommentService service = new CommentService(commentRepository, postService, accessControlService);
        Course course = new Course("6 Basico B", "6 Basico", "B", "Establecimiento Demo Aulafy");
        User professor = new User("Profesor Demo", "profesor@aulafy.cl", "hash", RoleName.PROFESOR, null);
        User student = new User("Estudiante Demo", "estudiante@aulafy.cl", "hash", RoleName.ESTUDIANTE, null);
        Post post = new Post(course, professor, "Aviso", "Contenido", PostType.AVISO, false);

        when(postService.getById(10L)).thenReturn(post);

        assertThatThrownBy(() -> service.create(10L, new CommentRequest("Recibido"), student))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("comentarios estan desactivados");
    }
}
