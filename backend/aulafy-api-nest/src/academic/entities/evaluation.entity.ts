import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { EvaluationType } from '../enums/evaluation-type.enum'

@Entity({ name: 'evaluations' })
export class EvaluationEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string

  @Column({ name: 'course_id', type: 'bigint', unsigned: true })
  courseId!: string

  @Column({ name: 'subject_id', type: 'bigint', unsigned: true })
  subjectId!: string

  @Column({ type: 'varchar', length: 160 })
  title!: string

  @Column({ type: 'text' })
  description!: string

  @Column({ type: 'enum', enum: EvaluationType })
  type!: EvaluationType

  @Column({ name: 'evaluation_date', type: 'date' })
  evaluationDate!: string

  @Column({ type: 'int', nullable: true })
  weight!: number | null

  @Column({ type: 'boolean', default: true })
  active!: boolean
}
