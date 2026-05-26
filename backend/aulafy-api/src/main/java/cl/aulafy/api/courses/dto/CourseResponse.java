package cl.aulafy.api.courses.dto;

import cl.aulafy.api.courses.entity.Course;

import java.time.LocalDateTime;

public record CourseResponse(
        Long id,
        String name,
        String level,
        String section,
        String schoolName,
        boolean active,
        int studentCount,
        int teacherCount,
        LocalDateTime createdAt
) {
    public static CourseResponse from(Course course) {
        return new CourseResponse(
                course.getId(),
                course.getName(),
                course.getLevel(),
                course.getSection(),
                course.getSchoolName(),
                course.isActive(),
                course.getStudents().size(),
                course.getTeachers().size(),
                course.getCreatedAt()
        );
    }
}
