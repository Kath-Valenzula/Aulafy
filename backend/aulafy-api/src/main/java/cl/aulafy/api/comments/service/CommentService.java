package cl.aulafy.api.comments.service;

import cl.aulafy.api.comments.dto.CommentRequest;
import cl.aulafy.api.comments.dto.CommentResponse;
import cl.aulafy.api.comments.entity.Comment;
import cl.aulafy.api.comments.repository.CommentRepository;
import cl.aulafy.api.common.exception.BusinessException;
import cl.aulafy.api.common.exception.ResourceNotFoundException;
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

    public CommentService(CommentRepository commentRepository, PostService postService) {
        this.commentRepository = commentRepository;
        this.postService = postService;
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> findByPost(Long postId) {
        return commentRepository.findByPostIdAndActiveTrueOrderByCreatedAtAsc(postId)
                .stream()
                .map(CommentResponse::from)
                .toList();
    }

    @Transactional
    public CommentResponse create(Long postId, CommentRequest request, User author) {
        Post post = postService.getById(postId);
        if (!post.isCommentsEnabled()) {
            throw new BusinessException("Los comentarios estan desactivados para esta publicacion");
        }
        Comment comment = new Comment(post, author, request.content().trim());
        return CommentResponse.from(commentRepository.save(comment));
    }

    @Transactional
    public void delete(Long id) {
        Comment comment = commentRepository.findById(id)
                .filter(Comment::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Comentario", id));
        comment.setActive(false);
    }
}
