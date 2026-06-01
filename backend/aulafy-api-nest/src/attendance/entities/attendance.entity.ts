import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AttendanceStatus } from '../enums/attendance-status.enum'

@Entity({ name: 'attendance' })
export class AttendanceEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string

  @Column({ name: 'student_id', type: 'bigint', unsigned: true })
  studentId!: string

  @Column({ name: 'course_id', type: 'bigint', unsigned: true })
  courseId!: string

  @Column({ type: 'date' })
  date!: string

  @Column({ type: 'enum', enum: AttendanceStatus })
  status!: AttendanceStatus

  @Column({ type: 'varchar', length: 300, nullable: true })
  comment!: string | null
}
