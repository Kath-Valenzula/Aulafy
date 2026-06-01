import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { Repository } from 'typeorm'
import { UserEntity } from '../users/entities/user.entity'
import { NotificationLogEntity } from './entities/notification-log.entity'

interface NotificationLogResponse {
  id: number
  type: string
  recipient: string
  message: string
  status: string
  detail: string | null
  createdAt: string
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationLogEntity)
    private readonly notificationLogRepository: Repository<NotificationLogEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly configService: ConfigService
  ) {}

  async listLogs(limit = 50): Promise<NotificationLogResponse[]> {
    const rows = await this.notificationLogRepository.find({
      order: { createdAt: 'DESC' },
      take: limit
    })
    return rows.map((row) => this.mapLog(row))
  }

  async sendTest(userId: number): Promise<NotificationLogResponse> {
    return this.sendTelegramInternal({
      type: 'TELEGRAM_TEST',
      userId,
      message: 'Mensaje de prueba Aulafy: integración Telegram operativa.',
      explicitChatId: null
    })
  }

  async sendMessage(userId: number, message: string, chatId?: string | null): Promise<NotificationLogResponse> {
    return this.sendTelegramInternal({
      type: 'TELEGRAM_MESSAGE',
      userId,
      message,
      explicitChatId: chatId ?? null
    })
  }

  async sendTypedMessage(
    userId: number,
    type: string,
    message: string,
    chatId?: string | null
  ): Promise<NotificationLogResponse> {
    return this.sendTelegramInternal({
      type,
      userId,
      message,
      explicitChatId: chatId ?? null
    })
  }

  private async sendTelegramInternal(input: {
    type: string
    userId: number
    message: string
    explicitChatId: string | null
  }): Promise<NotificationLogResponse> {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN')?.trim() || ''
    const user = await this.findUserOrFail(input.userId)
    const recipient = input.explicitChatId?.trim() || user.telegramChatId || ''

    // Modo degradado: se registra en bitacora para que backoffice tenga trazabilidad
    // incluso cuando el bot todavia no esta configurado en entorno.
    if (!token) {
      return this.createLog({
        type: input.type,
        recipient: recipient || 'NOT_CONFIGURED',
        message: input.message,
        status: 'NOT_CONFIGURED',
        detail: 'TELEGRAM_BOT_TOKEN no configurado'
      })
    }

    if (!recipient) {
      return this.createLog({
        type: input.type,
        recipient: 'NO_RECIPIENT',
        message: input.message,
        status: 'NO_RECIPIENT',
        detail: 'No existe chatId explícito ni telegram_chat_id en el usuario'
      })
    }

    try {
      // Envio directo al Bot API de Telegram; no requiere linking manual desde UI.
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          chat_id: recipient,
          text: input.message
        })
      })

      const payload = (await response.json()) as {
        ok?: boolean
        description?: string
        result?: { message_id?: number }
      }

      if (response.ok && payload.ok) {
        return this.createLog({
          type: input.type,
          recipient,
          message: input.message,
          status: 'SENT',
          detail: payload.result?.message_id ? `message_id=${payload.result.message_id}` : 'Mensaje enviado'
        })
      }

      return this.createLog({
        type: input.type,
        recipient,
        message: input.message,
        status: 'FAILED',
        detail: payload.description ?? `HTTP ${response.status}`
      })
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Error desconocido al enviar'
      return this.createLog({
        type: input.type,
        recipient,
        message: input.message,
        status: 'FAILED',
        detail
      })
    }
  }

  private async createLog(input: {
    type: string
    recipient: string
    message: string
    status: string
    detail: string | null
  }): Promise<NotificationLogResponse> {
    const log = this.notificationLogRepository.create({
      type: input.type,
      recipient: input.recipient,
      message: input.message,
      status: input.status,
      detail: input.detail
    })
    const created = await this.notificationLogRepository.save(log)
    return this.mapLog(created)
  }

  private mapLog(log: NotificationLogEntity): NotificationLogResponse {
    const createdAt = log.createdAt instanceof Date ? log.createdAt : new Date()
    return {
      id: Number(log.id),
      type: log.type,
      recipient: log.recipient,
      message: log.message,
      status: log.status,
      detail: log.detail,
      createdAt: createdAt.toISOString()
    }
  }

  private async findUserOrFail(userId: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id: String(userId) }
    })
    if (!user) {
      throw new NotFoundException(`Usuario ${userId} no encontrado`)
    }
    return user
  }
}
