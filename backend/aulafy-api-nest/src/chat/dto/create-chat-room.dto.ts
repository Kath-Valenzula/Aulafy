import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator'

export class CreateChatRoomDto {
  @IsInt()
  @Min(1)
  courseId!: number

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name!: string
}
