import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AcademicAccessModule } from '../common/access/academic-access.module'
import { StudentEntity } from '../academic-structure/entities/student.entity'
import { CourseEntity } from '../courses/entities/course.entity'
import { CourseStudentEntity } from '../courses/entities/course-student.entity'
import { SubjectEntity } from '../courses/entities/subject.entity'
import { AcademicController } from './academic.controller'
import { AcademicService } from './academic.service'
import { EvaluationEntity } from './entities/evaluation.entity'
import { GradeEntity } from './entities/grade.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EvaluationEntity,
      GradeEntity,
      CourseEntity,
      SubjectEntity,
      StudentEntity,
      CourseStudentEntity
    ]),
    AcademicAccessModule
  ],
  controllers: [AcademicController],
  providers: [AcademicService]
})
export class AcademicModule {}
