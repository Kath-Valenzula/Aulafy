import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JwtPayload } from '../common/auth/jwt-payload.interface'
import { AcademicAccessService } from '../common/access/academic-access.service'
import { RoleName } from '../users/enums/role-name.enum'
import { CourseEntity } from '../courses/entities/course.entity'
import { UserEntity } from '../users/entities/user.entity'
import { CreateCommentDto } from './dto/create-comment.dto'
import { CreatePostDto } from './dto/create-post.dto'
import { CommentEntity } from './entities/comment.entity'
import { PostEntity } from './entities/post.entity'

interface PostResponse {
  id: number
  courseId: number
  courseName: string
  authorId: number
  authorName: string
  title: string
  content: string
  type: string
  pinned: boolean
  commentsEnabled: boolean
  createdAt: string
}

interface CommentResponse {
  id: number
  postId: number
  authorId: number
  authorName: string
  content: string
  createdAt: string
}

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly accessService: AcademicAccessService
  ) {}

  async findPostsByCourse(courseId: number, user: JwtPayload): Promise<PostResponse[]> {
    await this.accessService.assertCanViewCourse(user, courseId)
    const course = await this.findCourseOrFail(courseId)

    const posts = await this.postRepository.find({
      where: {
        courseId: String(courseId),
        active: true
      },
      order: {
        pinned: 'DESC',
        createdAt: 'DESC'
      }
    })
    if (!posts.length) {
      return []
    }

    const authors = await this.userRepository.find({
      where: [...new Set(posts.map((post) => post.authorId))].map((id) => ({ id }))
    })
    const authorsMap = new Map(authors.map((author) => [author.id, author]))

    return posts.map((post) => this.mapPost(post, course, authorsMap.get(post.authorId)))
  }

  async createPost(courseId: number, request: CreatePostDto, user: JwtPayload): Promise<PostResponse> {
    await this.accessService.assertCanManageCourse(user, courseId)
    const GENERAL_POST_TYPES = ['AVISO', 'COMUNICADO', 'REUNION']
    if (GENERAL_POST_TYPES.includes(request.type) && user.role === RoleName.PROFESOR) {
      await this.accessService.assertTeacherCourseRole(user, courseId, ['HEAD_TEACHER'])
    }
    const course = await this.findCourseOrFail(courseId)
    const author = await this.findUserOrFail(user.sub)

    const post = this.postRepository.create({
      courseId: course.id,
      authorId: String(user.sub),
      title: request.title.trim(),
      content: request.content.trim(),
      type: request.type,
      pinned: false,
      commentsEnabled: request.commentsEnabled ?? true,
      active: true
    })
    const created = await this.postRepository.save(post)
    return this.mapPost(created, course, author)
  }

  async findCommentsByPost(postId: number, user: JwtPayload): Promise<CommentResponse[]> {
    const post = await this.findPostOrFail(postId)
    await this.accessService.assertCanViewCourse(user, Number(post.courseId))

    const comments = await this.commentRepository.find({
      where: {
        postId: String(postId),
        active: true
      },
      order: {
        createdAt: 'ASC'
      }
    })
    if (!comments.length) {
      return []
    }

    const authors = await this.userRepository.find({
      where: [...new Set(comments.map((comment) => comment.authorId))].map((id) => ({ id }))
    })
    const authorsMap = new Map(authors.map((author) => [author.id, author]))

    return comments.map((comment) => this.mapComment(comment, authorsMap.get(comment.authorId)))
  }

  async createComment(postId: number, request: CreateCommentDto, user: JwtPayload): Promise<CommentResponse> {
    const post = await this.findPostOrFail(postId)
    await this.accessService.assertCanViewCourse(user, Number(post.courseId))

    if (!post.commentsEnabled) {
      throw new BadRequestException('Los comentarios están deshabilitados en esta publicación')
    }

    const author = await this.findUserOrFail(user.sub)
    const comment = this.commentRepository.create({
      postId: post.id,
      authorId: String(user.sub),
      content: request.content.trim(),
      active: true
    })
    const created = await this.commentRepository.save(comment)
    return this.mapComment(created, author)
  }

  private mapPost(post: PostEntity, course: CourseEntity, author?: UserEntity): PostResponse {
    const createdAt = post.createdAt instanceof Date ? post.createdAt : new Date()
    return {
      id: Number(post.id),
      courseId: Number(post.courseId),
      courseName: course.name,
      authorId: Number(post.authorId),
      authorName: author?.fullName ?? 'Usuario',
      title: post.title,
      content: post.content,
      type: post.type,
      pinned: post.pinned,
      commentsEnabled: post.commentsEnabled,
      createdAt: createdAt.toISOString()
    }
  }

  private mapComment(comment: CommentEntity, author?: UserEntity): CommentResponse {
    const createdAt = comment.createdAt instanceof Date ? comment.createdAt : new Date()
    return {
      id: Number(comment.id),
      postId: Number(comment.postId),
      authorId: Number(comment.authorId),
      authorName: author?.fullName ?? 'Usuario',
      content: comment.content,
      createdAt: createdAt.toISOString()
    }
  }

  private async findPostOrFail(postId: number): Promise<PostEntity> {
    const post = await this.postRepository.findOne({
      where: {
        id: String(postId),
        active: true
      }
    })
    if (!post) {
      throw new NotFoundException(`Publicación ${postId} no encontrada`)
    }
    return post
  }

  private async findCourseOrFail(courseId: number): Promise<CourseEntity> {
    const course = await this.courseRepository.findOne({
      where: {
        id: String(courseId),
        active: true
      }
    })
    if (!course) {
      throw new NotFoundException(`Curso ${courseId} no encontrado`)
    }
    return course
  }

  private async findUserOrFail(userId: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id: String(userId) }
    })
    if (!user) {
      throw new NotFoundException(`Usuario ${userId} no encontrado`)
    }
    return user
  }
}
