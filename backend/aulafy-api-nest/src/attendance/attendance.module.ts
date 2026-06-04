import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AcademicAccessModule } from '../common/access/academic-access.module'
import { StudentEntity } from '../academic-structure/entities/student.entity'
import { CourseEntity } from '../courses/entities/course.entity'
import { CourseStudentEntity } from '../courses/entities/course-student.entity'
import { AttendanceController } from './attendance.controller'
import { AttendanceService } from './attendance.service'
import { AttendanceEntity } from './entities/attendance.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([AttendanceEntity, StudentEntity, CourseEntity, CourseStudentEntity]),
    AcademicAccessModule
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService]
})
export class AttendanceModule {}
