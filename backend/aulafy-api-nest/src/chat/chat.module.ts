import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StudentEntity } from '../academic-structure/entities/student.entity'
import { AcademicAccessModule } from '../common/access/academic-access.module'
import { CourseEntity } from '../courses/entities/course.entity'
import { CourseStudentEntity } from '../courses/entities/course-student.entity'
import { CourseTeacherEntity } from '../courses/entities/course-teacher.entity'
import { NotificationsModule } from '../notifications/notifications.module'
import { UserEntity } from '../users/entities/user.entity'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'
import { ChatMessageEntity } from './entities/chat-message.entity'
import { ChatRoomEntity } from './entities/chat-room.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatRoomEntity,
      ChatMessageEntity,
      CourseEntity,
      UserEntity,
      CourseTeacherEntity,
      CourseStudentEntity,
      StudentEntity
    ]),
    AcademicAccessModule,
    NotificationsModule
  ],
  controllers: [ChatController],
  providers: [ChatService]
})
export class ChatModule {}
