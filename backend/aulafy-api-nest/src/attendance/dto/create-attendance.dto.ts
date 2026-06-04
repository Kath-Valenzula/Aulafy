import { IsDateString, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator'
import { AttendanceStatus } from '../enums/attendance-status.enum'

export class CreateAttendanceDto {
  @IsInt()
  @Min(1)
  studentId!: number

  @IsInt()
  @Min(1)
  courseId!: number

  @IsDateString()
  date!: string

  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus

  @IsOptional()
  @IsString()
  @MaxLength(300)
  comment?: string
}
