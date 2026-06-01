import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'chat_messages' })
export class ChatMessageEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string

  @Column({ name: 'room_id', type: 'bigint', unsigned: true })
  roomId!: string

  @Column({ name: 'author_id', type: 'bigint', unsigned: true })
  authorId!: string

  @Column({ type: 'text' })
  content!: string

  @Column({ type: 'boolean', default: true })
  active!: boolean

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date
}
