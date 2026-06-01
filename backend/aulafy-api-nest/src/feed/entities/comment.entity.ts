import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'comments' })
export class CommentEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string

  @Column({ name: 'post_id', type: 'bigint', unsigned: true })
  postId!: string

  @Column({ name: 'author_id', type: 'bigint', unsigned: true })
  authorId!: string

  @Column({ type: 'varchar', length: 600 })
  content!: string

  @Column({ type: 'boolean', default: true })
  active!: boolean

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date
}
