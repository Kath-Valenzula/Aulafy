package cl.aulafy.api.academic.service;

import cl.aulafy.api.academic.entity.Grade;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class AcademicSummaryService {

    public BigDecimal calculateAverage(List<Grade> grades) {
        if (grades == null || grades.isEmpty()) {
            return BigDecimal.ZERO.setScale(2);
        }
        BigDecimal total = grades.stream()
                .map(Grade::getScore)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return total.divide(BigDecimal.valueOf(grades.size()), 2, RoundingMode.HALF_UP);
    }

    public String resolveStatus(BigDecimal average) {
        return resolveStatus(average, 1);
    }

    public String resolveStatus(BigDecimal average, int gradeCount) {
        if (gradeCount == 0) {
            return "SIN_DATOS";
        }
        if (average.compareTo(BigDecimal.valueOf(5.5)) >= 0) {
            return "DESTACADO";
        }
        if (average.compareTo(BigDecimal.valueOf(4.0)) >= 0) {
            return "AL_DIA";
        }
        return "RIESGO";
    }

    public String resolveMessage(int gradeCount) {
        if (gradeCount == 0) {
            return "Sin evaluaciones registradas";
        }
        if (gradeCount == 1) {
            return "Promedio parcial basado en 1 evaluacion registrada";
        }
        return "Promedio parcial basado en " + gradeCount + " evaluaciones registradas";
    }
}
