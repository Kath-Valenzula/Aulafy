import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StudentEntity } from '../academic-structure/entities/student.entity'
import { AcademicAccessModule } from '../common/access/academic-access.module'
import { CourseEntity } from '../courses/entities/course.entity'
import { CourseStudentEntity } from '../courses/entities/course-student.entity'
import { CourseTeacherEntity } from '../courses/entities/course-teacher.entity'
import { NotificationsModule } from '../notifications/notifications.module'
import { UserEntity } from '../users/entities/user.entity'
import { CalendarController } from './calendar.controller'
import { CalendarService } from './calendar.service'
import { CalendarEventEntity } from './entities/calendar-event.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CalendarEventEntity,
      CourseEntity,
      UserEntity,
      CourseStudentEntity,
      CourseTeacherEntity,
      StudentEntity
    ]),
    AcademicAccessModule,
    NotificationsModule
  ],
  controllers: [CalendarController],
  providers: [CalendarService]
})
export class CalendarModule {}
