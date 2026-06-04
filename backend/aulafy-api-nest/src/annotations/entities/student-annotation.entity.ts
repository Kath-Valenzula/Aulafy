import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AnnotationSeverity } from '../enums/annotation-severity.enum'
import { AnnotationStatus } from '../enums/annotation-status.enum'
import { AnnotationType } from '../enums/annotation-type.enum'

@Entity({ name: 'student_annotations' })
export class StudentAnnotationEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string

  @Column({ name: 'student_id', type: 'bigint', unsigned: true })
  studentId!: string

  @Column({ name: 'course_id', type: 'bigint', unsigned: true })
  courseId!: string

  @Column({ name: 'created_by_id', type: 'bigint', unsigned: true })
  createdById!: string

  @Column({ type: 'enum', enum: AnnotationType })
  type!: AnnotationType

  @Column({ type: 'enum', enum: AnnotationSeverity })
  severity!: AnnotationSeverity

  @Column({ type: 'enum', enum: AnnotationStatus, default: AnnotationStatus.PENDIENTE })
  status!: AnnotationStatus

  @Column({ type: 'varchar', length: 160 })
  title!: string

  @Column({ type: 'text' })
  description!: string

  @Column({ type: 'boolean', default: true })
  active!: boolean

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date
}
