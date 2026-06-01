import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'notification_logs' })
export class NotificationLogEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string

  @Column({ type: 'varchar', length: 30 })
  type!: string

  @Column({ type: 'varchar', length: 120 })
  recipient!: string

  @Column({ type: 'text' })
  message!: string

  @Column({ type: 'varchar', length: 40 })
  status!: string

  @Column({ type: 'varchar', length: 500, nullable: true })
  detail!: string | null

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date
}
