import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'levels' })
export class LevelEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string

  @Column({ type: 'varchar', length: 120, unique: true })
  name!: string

  @Column({ name: 'sort_order', type: 'int', default: 99 })
  sortOrder!: number

  @Column({ type: 'boolean', default: true })
  active!: boolean

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date
}
