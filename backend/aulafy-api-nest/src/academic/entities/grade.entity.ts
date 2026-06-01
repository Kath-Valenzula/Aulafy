import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'grades' })
export class GradeEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string

  @Column({ name: 'student_id', type: 'bigint', unsigned: true })
  studentId!: string

  @Column({ name: 'evaluation_id', type: 'bigint', unsigned: true })
  evaluationId!: string

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  score!: string

  @Column({ name: 'max_score', type: 'decimal', precision: 4, scale: 2 })
  maxScore!: string

  @Column({ type: 'varchar', length: 300, nullable: true })
  observation!: string | null

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date
}
