import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'students' })
export class StudentEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string

  @Column({ name: 'first_name', type: 'varchar', length: 80 })
  firstName!: string

  @Column({ name: 'last_name', type: 'varchar', length: 80 })
  lastName!: string

  @Column({ name: 'level_id', type: 'bigint', unsigned: true })
  levelId!: string

  @Column({ type: 'varchar', length: 20 })
  section!: string

  @Column({ name: 'guardian_id', type: 'bigint', unsigned: true, nullable: true })
  guardianId!: string | null

  @Column({ name: 'student_user_id', type: 'bigint', unsigned: true, nullable: true })
  studentUserId!: string | null

  @Column({ type: 'varchar', length: 300, default: '' })
  notes!: string

  @Column({ type: 'boolean', default: true })
  active!: boolean

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date
}
