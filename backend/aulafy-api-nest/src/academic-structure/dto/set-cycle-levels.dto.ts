import { ArrayUnique, IsArray, IsInt, Min } from 'class-validator'

export class SetCycleLevelsDto {
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  levelIds!: number[]
}
