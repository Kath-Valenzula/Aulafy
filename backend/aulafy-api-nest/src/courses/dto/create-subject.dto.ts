import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator'

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string

  @IsInt()
  @Min(1)
  courseId!: number

  @IsOptional()
  @IsInt()
  @Min(1)
  teacherId?: number

  @IsOptional()
  @IsBoolean()
  active?: boolean
}
