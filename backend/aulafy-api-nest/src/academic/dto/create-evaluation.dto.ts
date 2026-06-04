import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min
} from 'class-validator'
import { EvaluationType } from '../enums/evaluation-type.enum'

export class CreateEvaluationDto {
  @IsInt()
  @Min(1)
  courseId!: number

  @IsInt()
  @Min(1)
  subjectId!: number

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title!: string

  @IsString()
  @IsNotEmpty()
  description!: string

  @IsEnum(EvaluationType)
  type!: EvaluationType

  @IsDateString()
  evaluationDate!: string

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  weight?: number

  @IsOptional()
  @IsBoolean()
  active?: boolean
}
