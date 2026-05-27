package cl.aulafy.api.courses.repository;

import cl.aulafy.api.courses.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByActiveTrueOrderByCourseNameAscNameAsc();

    List<Subject> findByCourseIdAndActiveTrueOrderByNameAsc(Long courseId);
}
