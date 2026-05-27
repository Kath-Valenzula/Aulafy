package cl.aulafy.api.comments.service;

import cl.aulafy.api.comments.dto.CommentRequest;
import cl.aulafy.api.comments.dto.CommentResponse;
import cl.aulafy.api.comments.entity.Comment;
import cl.aulafy.api.comments.repository.CommentRepository;
import cl.aulafy.api.common.exception.BusinessException;
import cl.aulafy.api.common.exception.ResourceNotFoundException;
import cl.aulafy.api.common.security.AccessControlService;
import cl.aulafy.api.posts.entity.Post;
import cl.aulafy.api.posts.service.PostService;
import cl.aulafy.api.users.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostService postService;
    private final AccessControlService accessControlService;

    public CommentService(CommentRepository commentRepository, PostService postService,
                          AccessControlService accessControlService) {
        this.commentRepository = commentRepository;
        this.postService = postService;
        this.accessControlService = accessControlService;
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> findByPost(Long postId, User user) {
        Post post = postService.getById(postId);
        accessControlService.assertCanViewCourse(user, post.getCourse());
        return commentRepository.findByPostIdAndActiveTrueOrderByCreatedAtAsc(postId)
                .stream()
                .map(CommentResponse::from)
                .toList();
    }

    @Transactional
    public CommentResponse create(Long postId, CommentRequest request, User author) {
        Post post = postService.getById(postId);
        accessControlService.assertCanViewCourse(author, post.getCourse());
        if (!post.isCommentsEnabled()) {
            throw new BusinessException("Los comentarios estan desactivados para esta publicacion");
        }
        Comment comment = new Comment(post, author, request.content().trim());
        return CommentResponse.from(commentRepository.save(comment));
    }

    @Transactional
    public void delete(Long id, User user) {
        Comment comment = commentRepository.findById(id)
                .filter(Comment::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Comentario", id));
        accessControlService.assertCanDeleteComment(user, comment.getAuthor().getId(), comment.getPost());
        comment.setActive(false);
    }
}
