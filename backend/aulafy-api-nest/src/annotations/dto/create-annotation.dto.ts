import { IsEnum, IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator'
import { AnnotationSeverity } from '../enums/annotation-severity.enum'
import { AnnotationType } from '../enums/annotation-type.enum'

export class CreateAnnotationDto {
  @IsInt()
  @Min(1)
  studentId!: number

  @IsInt()
  @Min(1)
  courseId!: number

  @IsEnum(AnnotationType)
  type!: AnnotationType

  @IsEnum(AnnotationSeverity)
  severity!: AnnotationSeverity

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title!: string

  @IsString()
  @IsNotEmpty()
  description!: string
}
