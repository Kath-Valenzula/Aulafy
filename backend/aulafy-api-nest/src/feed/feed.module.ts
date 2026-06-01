import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AcademicAccessModule } from '../common/access/academic-access.module'
import { CourseEntity } from '../courses/entities/course.entity'
import { UserEntity } from '../users/entities/user.entity'
import { FeedController } from './feed.controller'
import { FeedService } from './feed.service'
import { CommentEntity } from './entities/comment.entity'
import { PostEntity } from './entities/post.entity'

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, CommentEntity, CourseEntity, UserEntity]), AcademicAccessModule],
  controllers: [FeedController],
  providers: [FeedService]
})
export class FeedModule {}
