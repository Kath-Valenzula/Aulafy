import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../common/auth/current-user.decorator'
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard'
import { JwtPayload } from '../common/auth/jwt-payload.interface'
import { Roles } from '../common/auth/roles.decorator'
import { RolesGuard } from '../common/auth/roles.guard'
import { RoleName } from '../users/enums/role-name.enum'
import { CreateCommentDto } from './dto/create-comment.dto'
import { CreatePostDto } from './dto/create-post.dto'
import { FeedService } from './feed.service'

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get('courses/:courseId/posts')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO, RoleName.PROFESOR, RoleName.APODERADO, RoleName.ESTUDIANTE)
  findByCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUser() user: JwtPayload
  ) {
    return this.feedService.findPostsByCourse(courseId, user)
  }

  @Post('courses/:courseId/posts')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO, RoleName.PROFESOR)
  createPost(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() request: CreatePostDto,
    @CurrentUser() user: JwtPayload
  ) {
    return this.feedService.createPost(courseId, request, user)
  }

  @Get('posts/:postId/comments')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO, RoleName.PROFESOR, RoleName.APODERADO, RoleName.ESTUDIANTE)
  findComments(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser() user: JwtPayload
  ) {
    return this.feedService.findCommentsByPost(postId, user)
  }

  @Post('posts/:postId/comments')
  @Roles(RoleName.ADMIN, RoleName.COLEGIO, RoleName.PROFESOR, RoleName.APODERADO, RoleName.ESTUDIANTE)
  createComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() request: CreateCommentDto,
    @CurrentUser() user: JwtPayload
  ) {
    return this.feedService.createComment(postId, request, user)
  }
}
