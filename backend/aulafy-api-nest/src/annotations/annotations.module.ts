import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StudentEntity } from '../academic-structure/entities/student.entity'
import { AcademicAccessModule } from '../common/access/academic-access.module'
import { CourseEntity } from '../courses/entities/course.entity'
import { CourseStudentEntity } from '../courses/entities/course-student.entity'
import { NotificationsModule } from '../notifications/notifications.module'
import { UserEntity } from '../users/entities/user.entity'
import { AnnotationsController } from './annotations.controller'
import { AnnotationsService } from './annotations.service'
import { StudentAnnotationEntity } from './entities/student-annotation.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([StudentAnnotationEntity, StudentEntity, CourseEntity, CourseStudentEntity, UserEntity]),
    AcademicAccessModule,
    NotificationsModule
  ],
  controllers: [AnnotationsController],
  providers: [AnnotationsService]
})
export class AnnotationsModule {}
