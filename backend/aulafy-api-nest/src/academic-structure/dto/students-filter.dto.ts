import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator'

export class StudentsFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  levelId?: number

  @IsOptional()
  @IsString()
  @MaxLength(20)
  section?: string
}
