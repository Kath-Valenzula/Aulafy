import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity({ name: 'course_teachers' })
export class CourseTeacherEntity {
  @PrimaryColumn({ name: 'course_id', type: 'bigint', unsigned: true })
  courseId!: string

  @PrimaryColumn({ name: 'teacher_id', type: 'bigint', unsigned: true })
  teacherId!: string

  @Column({ name: 'role_in_course', type: 'varchar', length: 30, default: 'SUBJECT_TEACHER' })
  roleInCourse!: string
}
