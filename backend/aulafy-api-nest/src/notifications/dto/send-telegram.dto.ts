import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class SendTelegramDto {
  @IsString()
  @IsNotEmpty()
  message!: string

  @IsOptional()
  @IsString()
  @MaxLength(80)
  chatId?: string
}
