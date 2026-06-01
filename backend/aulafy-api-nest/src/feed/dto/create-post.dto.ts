import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { PostType } from '../enums/post-type.enum'

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title!: string

  @IsString()
  @IsNotEmpty()
  content!: string

  @IsEnum(PostType)
  type!: PostType

  @IsOptional()
  @IsBoolean()
  commentsEnabled?: boolean
}
