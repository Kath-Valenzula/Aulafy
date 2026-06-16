import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AcademicAccessModule } from '../common/access/academic-access.module'
import { LevelEntity } from '../academic-structure/entities/level.entity'
import { StudentEntity } from '../academic-structure/entities/student.entity'
import { EvaluationEntity } from '../academic/entities/evaluation.entity'
import { GradeEntity } from '../academic/entities/grade.entity'
import { AttendanceEntity } from '../attendance/entities/attendance.entity'
import { CourseEntity } from '../courses/entities/course.entity'
import { CourseStudentEntity } from '../courses/entities/course-student.entity'
import { RiskController } from './risk.controller'
import { RiskService } from './risk.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttendanceEntity,
      CourseEntity,
      CourseStudentEntity,
      EvaluationEntity,
      GradeEntity,
      LevelEntity,
      StudentEntity
    ]),
    AcademicAccessModule
  ],
  controllers: [RiskController],
  providers: [RiskService]
})
export class RiskModule {}
