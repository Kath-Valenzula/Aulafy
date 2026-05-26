package cl.aulafy.api.courses.repository;

import cl.aulafy.api.courses.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
}
