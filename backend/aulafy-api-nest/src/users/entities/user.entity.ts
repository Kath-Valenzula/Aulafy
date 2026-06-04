import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { RoleName } from '../enums/role-name.enum';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 120 })
  fullName!: string;

  @Column({ type: 'varchar', length: 160, unique: true })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ type: 'enum', enum: RoleName })
  role!: RoleName;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ name: 'telegram_chat_id', type: 'varchar', length: 80, nullable: true })
  telegramChatId!: string | null;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}
