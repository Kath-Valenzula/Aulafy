package cl.aulafy.api.courses.repository;

import cl.aulafy.api.courses.entity.GuardianStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GuardianStudentRepository extends JpaRepository<GuardianStudent, Long> {

    @Query("""
            select count(gs) > 0 from GuardianStudent gs
            where gs.guardian.id = :guardianId and gs.student.id = :studentId
            """)
    boolean existsGuardianStudentLink(@Param("guardianId") Long guardianId, @Param("studentId") Long studentId);

    @Query("""
            select count(c) > 0 from Course c
            join c.students s
            join GuardianStudent gs on gs.student.id = s.id
            where c.id = :courseId and gs.guardian.id = :guardianId
            """)
    boolean existsGuardianLinkedToCourse(@Param("guardianId") Long guardianId, @Param("courseId") Long courseId);
}
