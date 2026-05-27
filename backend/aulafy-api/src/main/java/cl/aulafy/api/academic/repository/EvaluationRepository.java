package cl.aulafy.api.academic.repository;

import cl.aulafy.api.academic.entity.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    List<Evaluation> findByCourseIdAndActiveTrueOrderByEvaluationDateAsc(Long courseId);
}
