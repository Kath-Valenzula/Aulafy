import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AcademicAccessModule } from '../common/access/academic-access.module'
import { UserEntity } from '../users/entities/user.entity'
import { NotificationLogEntity } from './entities/notification-log.entity'
import { NotificationsController } from './notifications.controller'
import { NotificationsService } from './notifications.service'

@Module({
  imports: [TypeOrmModule.forFeature([NotificationLogEntity, UserEntity]), AcademicAccessModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService]
})
export class NotificationsModule {}
