package cl.aulafy.api.courses.repository;

import cl.aulafy.api.courses.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByActiveTrueOrderByNameAsc();
}
