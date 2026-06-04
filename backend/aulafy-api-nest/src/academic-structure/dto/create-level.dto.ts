import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator'

export class CreateLevelDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number
}
