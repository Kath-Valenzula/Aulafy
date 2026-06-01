import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'chat_rooms' })
export class ChatRoomEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string

  @Column({ name: 'course_id', type: 'bigint', unsigned: true })
  courseId!: string

  @Column({ type: 'varchar', length: 160 })
  name!: string

  @Column({ name: 'created_by_id', type: 'bigint', unsigned: true })
  createdById!: string

  @Column({ type: 'boolean', default: true })
  active!: boolean

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date
}
