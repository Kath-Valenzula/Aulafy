package cl.aulafy.api.attendance.dto;

import java.math.BigDecimal;

public record AttendanceSummaryResponse(
        Long studentId,
        String studentName,
        long totalRecords,
        long presentRecords,
        long absentRecords,
        long justifiedRecords,
        long lateRecords,
        BigDecimal attendancePercentage,
        String status
) {
}
