import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AcademicAccessModule } from '../common/access/academic-access.module'
import { LevelEntity } from '../academic-structure/entities/level.entity'
import { CycleEntity } from '../academic-structure/entities/cycle.entity'
import { StudentEntity } from '../academic-structure/entities/student.entity'
import { UserEntity } from '../users/entities/user.entity'
import { CoursesController } from './courses.controller'
import { CoursesService } from './courses.service'
import { CourseEntity } from './entities/course.entity'
import { CourseStudentEntity } from './entities/course-student.entity'
import { CourseTeacherEntity } from './entities/course-teacher.entity'
import { SubjectEntity } from './entities/subject.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseEntity,
      CourseStudentEntity,
      CourseTeacherEntity,
      SubjectEntity,
      UserEntity,
      LevelEntity,
      CycleEntity,
      StudentEntity
    ]),
    AcademicAccessModule
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService, TypeOrmModule]
})
export class CoursesModule {}
