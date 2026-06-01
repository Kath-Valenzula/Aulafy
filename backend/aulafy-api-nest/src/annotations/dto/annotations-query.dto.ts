import { Type } from 'class-transformer'
import { IsInt, IsOptional, Min } from 'class-validator'

export class AnnotationsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  courseId?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  studentId?: number
}
