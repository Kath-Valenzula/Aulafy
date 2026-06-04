import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator'

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  level!: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  section!: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  schoolName!: string

  @IsOptional()
  @IsInt()
  @Min(1)
  levelId?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  cycleId?: number
}
