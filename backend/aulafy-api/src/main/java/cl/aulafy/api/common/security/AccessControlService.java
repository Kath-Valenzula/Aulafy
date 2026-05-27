package cl.aulafy.api.common.security;

import cl.aulafy.api.courses.entity.Course;
import cl.aulafy.api.courses.repository.CourseRepository;
import cl.aulafy.api.courses.repository.GuardianStudentRepository;
import cl.aulafy.api.posts.entity.Post;
import cl.aulafy.api.users.entity.RoleName;
import cl.aulafy.api.users.entity.User;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccessControlService {

    private final CourseRepository courseRepository;
    private final GuardianStudentRepository guardianStudentRepository;

    public AccessControlService(CourseRepository courseRepository, GuardianStudentRepository guardianStudentRepository) {
        this.courseRepository = courseRepository;
        this.guardianStudentRepository = guardianStudentRepository;
    }

    @Transactional(readOnly = true)
    public void assertCanViewCourse(User user, Course course) {
        if (!canViewCourse(user, course.getId())) {
            throw forbidden("No tienes permiso para ver este curso");
        }
    }

    @Transactional(readOnly = true)
    public void assertCanManageCourse(User user, Course course) {
        if (isAdminOrSchool(user)) {
            return;
        }
        if (user.getRole() == RoleName.PROFESOR
                && courseRepository.existsTeacherInCourse(course.getId(), user.getId())) {
            return;
        }
        throw forbidden("No tienes permiso para administrar este curso");
    }

    @Transactional(readOnly = true)
    public void assertCanViewStudent(User user, Long studentId) {
        if (isAdminOrSchool(user)) {
            return;
        }
        if (user.getRole() == RoleName.ESTUDIANTE && user.getId().equals(studentId)) {
            return;
        }
        if (user.getRole() == RoleName.APODERADO
                && guardianStudentRepository.existsGuardianStudentLink(user.getId(), studentId)) {
            return;
        }
        if (user.getRole() == RoleName.PROFESOR
                && courseRepository.existsTeacherWithStudent(user.getId(), studentId)) {
            return;
        }
        throw forbidden("No tienes permiso para ver informacion de este estudiante");
    }

    @Transactional(readOnly = true)
    public void assertCanManageStudentRecord(User user, Long studentId, Long courseId) {
        if (isAdminOrSchool(user)) {
            return;
        }
        if (user.getRole() == RoleName.PROFESOR
                && courseRepository.existsTeacherInCourse(courseId, user.getId())
                && courseRepository.existsStudentInCourse(courseId, studentId)) {
            return;
        }
        throw forbidden("No tienes permiso para registrar informacion academica de este estudiante");
    }

    @Transactional(readOnly = true)
    public void assertCanManagePost(User user, Post post) {
        if (isAdminOrSchool(user)) {
            return;
        }
        if (user.getRole() == RoleName.PROFESOR && post.getAuthor().getId().equals(user.getId())) {
            return;
        }
        throw forbidden("No tienes permiso para modificar esta publicacion");
    }

    @Transactional(readOnly = true)
    public void assertCanDeleteComment(User user, Long commentAuthorId, Post post) {
        if (isAdminOrSchool(user)) {
            return;
        }
        if (commentAuthorId.equals(user.getId())) {
            return;
        }
        if (user.getRole() == RoleName.PROFESOR && post.getAuthor().getId().equals(user.getId())) {
            return;
        }
        throw forbidden("No tienes permiso para eliminar este comentario");
    }

    private boolean canViewCourse(User user, Long courseId) {
        if (isAdminOrSchool(user)) {
            return true;
        }
        if (user.getRole() == RoleName.PROFESOR) {
            return courseRepository.existsTeacherInCourse(courseId, user.getId());
        }
        if (user.getRole() == RoleName.ESTUDIANTE) {
            return courseRepository.existsStudentInCourse(courseId, user.getId());
        }
        return user.getRole() == RoleName.APODERADO
                && guardianStudentRepository.existsGuardianLinkedToCourse(user.getId(), courseId);
    }

    private boolean isAdminOrSchool(User user) {
        return user.getRole() == RoleName.ADMIN || user.getRole() == RoleName.COLEGIO;
    }

    private AccessDeniedException forbidden(String message) {
        return new AccessDeniedException(message);
    }
}
