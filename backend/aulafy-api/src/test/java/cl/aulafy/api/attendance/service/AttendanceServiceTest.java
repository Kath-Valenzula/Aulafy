package cl.aulafy.api.attendance.service;

import cl.aulafy.api.attendance.entity.Attendance;
import cl.aulafy.api.attendance.entity.AttendanceStatus;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class AttendanceServiceTest {

    @Test
    void calculateAttendancePercentageCountsPresentAndLateAsAttendance() {
        AttendanceService service = new AttendanceService(null, null, null, null);
        List<Attendance> records = List.of(
                new Attendance(null, null, LocalDate.now(), AttendanceStatus.PRESENTE, null),
                new Attendance(null, null, LocalDate.now(), AttendanceStatus.ATRASADO, null),
                new Attendance(null, null, LocalDate.now(), AttendanceStatus.AUSENTE, null),
                new Attendance(null, null, LocalDate.now(), AttendanceStatus.JUSTIFICADO, null)
        );

        BigDecimal percentage = service.calculateAttendancePercentage(records);

        assertThat(percentage).isEqualByComparingTo("50.00");
    }
}
