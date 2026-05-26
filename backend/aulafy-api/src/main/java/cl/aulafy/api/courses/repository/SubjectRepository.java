package cl.aulafy.api.courses.repository;

import cl.aulafy.api.courses.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
}
