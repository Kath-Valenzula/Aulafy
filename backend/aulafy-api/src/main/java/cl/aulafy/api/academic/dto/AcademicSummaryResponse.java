package cl.aulafy.api.academic.dto;

import java.math.BigDecimal;

public record AcademicSummaryResponse(
        Long studentId,
        String studentName,
        int gradeCount,
        BigDecimal averageScore,
        String status,
        String message
) {
}
