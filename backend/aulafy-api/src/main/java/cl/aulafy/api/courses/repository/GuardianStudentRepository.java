package cl.aulafy.api.courses.repository;

import cl.aulafy.api.courses.entity.GuardianStudent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GuardianStudentRepository extends JpaRepository<GuardianStudent, Long> {
}
