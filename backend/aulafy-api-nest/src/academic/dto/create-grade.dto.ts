import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min
} from 'class-validator'

export class CreateGradeDto {
  @IsInt()
  @Min(1)
  studentId!: number

  @IsInt()
  @Min(1)
  evaluationId!: number

  @IsNumber()
  @Min(1)
  @Max(7)
  score!: number

  @IsNumber()
  @Min(1)
  maxScore!: number

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  observation?: string
}
