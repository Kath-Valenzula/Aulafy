import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'subjects' })
export class SubjectEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string

  @Column({ type: 'varchar', length: 120 })
  name!: string

  @Column({ name: 'course_id', type: 'bigint', unsigned: true })
  courseId!: string

  @Column({ name: 'teacher_id', type: 'bigint', unsigned: true, nullable: true })
  teacherId!: string | null

  @Column({ type: 'boolean', default: true })
  active!: boolean
}
