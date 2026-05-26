package cl.aulafy.api.academic.service;

import cl.aulafy.api.academic.entity.Grade;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class AcademicSummaryServiceTest {

    private final AcademicSummaryService service = new AcademicSummaryService();

    @Test
    void calculateAverageReturnsPartialAverageWithTwoDecimals() {
        Grade first = new Grade(null, null, BigDecimal.valueOf(6.5), BigDecimal.valueOf(7), null);
        Grade second = new Grade(null, null, BigDecimal.valueOf(5.5), BigDecimal.valueOf(7), null);

        BigDecimal average = service.calculateAverage(List.of(first, second));

        assertThat(average).isEqualByComparingTo("6.00");
    }
}
