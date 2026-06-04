import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StudentEntity } from '../../academic-structure/entities/student.entity'
import { CourseStudentEntity } from '../../courses/entities/course-student.entity'
import { CourseTeacherEntity } from '../../courses/entities/course-teacher.entity'
import { AcademicAccessService } from './academic-access.service'

@Module({
  imports: [TypeOrmModule.forFeature([CourseStudentEntity, CourseTeacherEntity, StudentEntity])],
  providers: [AcademicAccessService],
  exports: [AcademicAccessService]
})
export class AcademicAccessModule {}
