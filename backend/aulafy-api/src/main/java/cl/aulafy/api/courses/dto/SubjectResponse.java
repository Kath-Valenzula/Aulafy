package cl.aulafy.api.courses.dto;

import cl.aulafy.api.courses.entity.Subject;

public record SubjectResponse(
        Long id,
        String name,
        Long courseId,
        String courseName,
        Long teacherId,
        String teacherName,
        boolean active
) {
    public static SubjectResponse from(Subject subject) {
        return new SubjectResponse(
                subject.getId(),
                subject.getName(),
                subject.getCourse().getId(),
                subject.getCourse().getName(),
                subject.getTeacher() == null ? null : subject.getTeacher().getId(),
                subject.getTeacher() == null ? null : subject.getTeacher().getFullName(),
                subject.isActive()
        );
    }
}
