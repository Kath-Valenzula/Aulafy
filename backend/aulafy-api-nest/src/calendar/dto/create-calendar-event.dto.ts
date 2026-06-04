import { IsBoolean, IsDateString, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

const ALLOWED_EVENT_TYPES = ['PRUEBA', 'TAREA', 'REUNION', 'ACTIVIDAD', 'COMUNICADO'] as const

export class CreateCalendarEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title!: string

  @IsString()
  @IsNotEmpty()
  description!: string

  @IsString()
  @IsIn(ALLOWED_EVENT_TYPES)
  type!: (typeof ALLOWED_EVENT_TYPES)[number]

  @IsDateString()
  startAt!: string

  @IsOptional()
  @IsDateString()
  endAt?: string

  @IsBoolean()
  notifyTelegram!: boolean
}
