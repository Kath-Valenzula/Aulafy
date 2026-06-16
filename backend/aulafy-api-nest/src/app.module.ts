import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AcademicStructureModule } from './academic-structure/academic-structure.module';
import { AcademicModule } from './academic/academic.module';
import { AnnotationsModule } from './annotations/annotations.module';
import { AuthModule } from './auth/auth.module';
import { AttendanceModule } from './attendance/attendance.module';
import { CalendarModule } from './calendar/calendar.module';
import { ChatModule } from './chat/chat.module';
import { validateEnv } from './common/config/env.validation';
import { CoursesModule } from './courses/courses.module';
import { DatabaseModule } from './database/database.module';
import { FeedModule } from './feed/feed.module';
import { HealthModule } from './health/health.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RiskModule } from './risk/risk.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    AcademicStructureModule,
    CoursesModule,
    AcademicModule,
    AttendanceModule,
    FeedModule,
    ChatModule,
    CalendarModule,
    AnnotationsModule,
    NotificationsModule,
    RiskModule
  ]
})
export class AppModule {}
