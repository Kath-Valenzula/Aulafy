import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator'

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  firstName!: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  lastName!: string

  @IsInt()
  @Min(1)
  levelId!: number

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  section!: string

  @IsOptional()
  @IsInt()
  @Min(1)
  guardianId?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  studentUserId?: number

  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string
}
