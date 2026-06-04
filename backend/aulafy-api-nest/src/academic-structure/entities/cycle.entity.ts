import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'cycles' })
export class CycleEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string

  @Column({ type: 'varchar', length: 120, unique: true })
  name!: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  description!: string | null

  @Column({ type: 'boolean', default: true })
  active!: boolean

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date
}
