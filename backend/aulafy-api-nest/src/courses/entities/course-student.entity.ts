import { Entity, PrimaryColumn } from 'typeorm'

@Entity({ name: 'course_students' })
export class CourseStudentEntity {
  @PrimaryColumn({ name: 'course_id', type: 'bigint', unsigned: true })
  courseId!: string

  @PrimaryColumn({ name: 'student_id', type: 'bigint', unsigned: true })
  studentId!: string
}
