import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { PostType } from '../enums/post-type.enum'

@Entity({ name: 'posts' })
export class PostEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string

  @Column({ name: 'course_id', type: 'bigint', unsigned: true })
  courseId!: string

  @Column({ name: 'author_id', type: 'bigint', unsigned: true })
  authorId!: string

  @Column({ type: 'varchar', length: 160 })
  title!: string

  @Column({ type: 'text' })
  content!: string

  @Column({ type: 'enum', enum: PostType })
  type!: PostType

  @Column({ type: 'boolean', default: false })
  pinned!: boolean

  @Column({ name: 'comments_enabled', type: 'boolean', default: true })
  commentsEnabled!: boolean

  @Column({ type: 'boolean', default: true })
  active!: boolean

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date
}
