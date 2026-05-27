package cl.aulafy.api.courses.repository;

import cl.aulafy.api.courses.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByActiveTrueOrderByNameAsc();

    @Query("select c from Course c join c.teachers t where c.active = true and t.id = :teacherId order by c.name asc")
    List<Course> findActiveByTeacherId(@Param("teacherId") Long teacherId);

    @Query("select c from Course c join c.students s where c.active = true and s.id = :studentId order by c.name asc")
    List<Course> findActiveByStudentId(@Param("studentId") Long studentId);

    @Query("""
            select distinct c from Course c
            join c.students s
            join GuardianStudent gs on gs.student.id = s.id
            where c.active = true and gs.guardian.id = :guardianId
            order by c.name asc
            """)
    List<Course> findActiveByGuardianId(@Param("guardianId") Long guardianId);

    @Query("select count(c) > 0 from Course c join c.teachers t where c.id = :courseId and t.id = :teacherId")
    boolean existsTeacherInCourse(@Param("courseId") Long courseId, @Param("teacherId") Long teacherId);

    @Query("select count(c) > 0 from Course c join c.students s where c.id = :courseId and s.id = :studentId")
    boolean existsStudentInCourse(@Param("courseId") Long courseId, @Param("studentId") Long studentId);

    @Query("""
            select count(c) > 0 from Course c
            join c.teachers t
            join c.students s
            where t.id = :teacherId and s.id = :studentId
            """)
    boolean existsTeacherWithStudent(@Param("teacherId") Long teacherId, @Param("studentId") Long studentId);
}
