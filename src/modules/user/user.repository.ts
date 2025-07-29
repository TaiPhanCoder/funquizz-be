import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto | any): Promise<User> {
    const user = this.repository.create(createUserDto);
    const savedUser = await this.repository.save(user);
    return savedUser;
  }

  async findAll(): Promise<User[]> {
    return this.repository.find({
      select: ['id', 'email', 'username', 'isActive', 'createdAt', 'updatedAt'],
    });
  }

  async findOne(id: string): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
      select: ['id', 'email', 'username', 'isActive', 'createdAt', 'updatedAt'],
    });
  }

  async findOneWithPassword(criteria: { id?: string; email?: string }): Promise<User | null> {
    return this.repository.findOne({ where: criteria });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repository.findOne({ where: { username } });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email },
      select: ['id', 'email', 'username', 'password', 'isActive', 'createdAt', 'updatedAt'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto | any): Promise<void> {
    await this.repository.update(id, updateUserDto);
  }

  async remove(user: User): Promise<void> {
    await this.repository.remove(user);
  }
}