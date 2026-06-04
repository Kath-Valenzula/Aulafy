import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CourseStudentEntity } from '../courses/entities/course-student.entity'
import { CourseTeacherEntity } from '../courses/entities/course-teacher.entity'
import { UserEntity } from '../users/entities/user.entity'
import { AcademicStructureController } from './academic-structure.controller'
import { AcademicStructureService } from './academic-structure.service'
import { CycleEntity } from './entities/cycle.entity'
import { CycleLevelEntity } from './entities/cycle-level.entity'
import { LevelEntity } from './entities/level.entity'
import { StudentEntity } from './entities/student.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LevelEntity,
      CycleEntity,
      CycleLevelEntity,
      StudentEntity,
      UserEntity,
      CourseStudentEntity,
      CourseTeacherEntity
    ])
  ],
  controllers: [AcademicStructureController],
  providers: [AcademicStructureService]
})
export class AcademicStructureModule {}
