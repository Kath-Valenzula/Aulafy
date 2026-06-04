import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'calendar_events' })
export class CalendarEventEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string

  @Column({ name: 'course_id', type: 'bigint', unsigned: true })
  courseId!: string

  @Column({ name: 'created_by_id', type: 'bigint', unsigned: true })
  createdById!: string

  @Column({ type: 'varchar', length: 160 })
  title!: string

  @Column({ type: 'text' })
  description!: string

  @Column({ type: 'varchar', length: 30 })
  type!: string

  @Column({ name: 'start_at', type: 'datetime' })
  startAt!: Date

  @Column({ name: 'end_at', type: 'datetime', nullable: true })
  endAt!: Date | null

  @Column({ name: 'notify_telegram', type: 'boolean', default: false })
  notifyTelegram!: boolean

  @Column({ type: 'boolean', default: true })
  active!: boolean

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date
}
