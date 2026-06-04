import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'courses' })
export class CourseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string

  @Column({ type: 'varchar', length: 120 })
  name!: string

  @Column({ type: 'varchar', length: 80 })
  level!: string

  @Column({ type: 'varchar', length: 20 })
  section!: string

  @Column({ name: 'level_id', type: 'bigint', unsigned: true, nullable: true })
  levelId!: string | null

  @Column({ name: 'cycle_id', type: 'bigint', unsigned: true, nullable: true })
  cycleId!: string | null

  @Column({ name: 'school_name', type: 'varchar', length: 160 })
  schoolName!: string

  @Column({ type: 'boolean', default: true })
  active!: boolean

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date
}
