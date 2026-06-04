import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity({ name: 'cycle_levels' })
export class CycleLevelEntity {
  @PrimaryColumn({ name: 'cycle_id', type: 'bigint', unsigned: true })
  cycleId!: string

  @PrimaryColumn({ name: 'level_id', type: 'bigint', unsigned: true })
  levelId!: string

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date
}
