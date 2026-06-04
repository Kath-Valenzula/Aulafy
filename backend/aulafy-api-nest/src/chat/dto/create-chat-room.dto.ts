import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator'

export class CreateChatRoomDto {
  @IsInt()
  @Min(1)
  courseId!: number

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name?: string
}
