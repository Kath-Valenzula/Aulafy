import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { UserCreateDto } from './dto/user-create.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserStatusDto } from './dto/user-status.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { UserEntity } from './entities/user.entity';
import { toUserResponse } from './users.mapper';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find({
      order: { fullName: 'ASC' }
    });
    return users.map(toUserResponse);
  }

  async findById(id: number): Promise<UserResponseDto> {
    const user = await this.getEntityById(id);
    return toUserResponse(user);
  }

  async create(request: UserCreateDto): Promise<UserResponseDto> {
    const email = request.email.trim().toLowerCase();
    const fullName = request.fullName.trim();

    await this.ensureUniqueEmail(email);

    const user = this.userRepository.create({
      fullName,
      email,
      passwordHash: await bcrypt.hash(request.password, 10),
      role: request.role,
      active: true,
      telegramChatId: normalizeNullable(request.telegramChatId)
    });

    const saved = await this.userRepository.save(user);
    return toUserResponse(saved);
  }

  async update(id: number, request: UserUpdateDto): Promise<UserResponseDto> {
    const user = await this.getEntityById(id);
    const email = request.email.trim().toLowerCase();
    const fullName = request.fullName.trim();

    await this.ensureUniqueEmail(email, id);

    user.fullName = fullName;
    user.email = email;
    user.role = request.role;
    user.telegramChatId = normalizeNullable(request.telegramChatId);

    const updated = await this.userRepository.save(user);
    return toUserResponse(updated);
  }

  async updateStatus(id: number, request: UserStatusDto): Promise<UserResponseDto> {
    const user = await this.getEntityById(id);
    user.active = request.active;
    const updated = await this.userRepository.save(user);
    return toUserResponse(updated);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.email) = LOWER(:email)', { email: email.trim() })
      .getOne();
  }

  private async getEntityById(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id: String(id) } });
    if (!user) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }
    return user;
  }

  private async ensureUniqueEmail(email: string, excludeId?: number): Promise<void> {
    const existing = await this.findByEmail(email);
    if (!existing) {
      return;
    }
    if (excludeId && Number(existing.id) === excludeId) {
      return;
    }
    throw new ConflictException('Ya existe un usuario con ese correo');
  }
}

function normalizeNullable(value: string | null | undefined): string | null {
  if (!value || !value.trim()) {
    return null;
  }
  return value.trim();
}
