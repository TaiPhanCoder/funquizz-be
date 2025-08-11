import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlashcardSet } from './entities/flashcard-set.entity';
import { CreateFlashcardSetDto } from './dto/request/create-flashcard-set.dto';
import { UpdateFlashcardSetDto } from './dto/request/update-flashcard-set.dto';
import { FlashcardAccessType } from './enums/flashcard-access-type.enum';
import { SelectQueryBuilder } from 'typeorm';

@Injectable()
export class FlashcardSetRepository {
  constructor(
    @InjectRepository(FlashcardSet)
    private readonly repository: Repository<FlashcardSet>,
  ) {}

  async create(dto: CreateFlashcardSetDto, userId: string): Promise<FlashcardSet> {
    const set = this.repository.create({ ...dto, userId });
    return await this.repository.save(set);
  }

  async findAllByUser(userId: string): Promise<FlashcardSet[]> {
    return this.repository.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async findByIdForAccess(id: string, userId?: string): Promise<FlashcardSet | null> {
    const qb = this.repository.createQueryBuilder('set')
      .where('set.id = :id', { id });

    if (userId) {
      qb.andWhere('(set.accessType = :public OR set.userId = :userId OR set.accessType = :setpass)', { public: FlashcardAccessType.PUBLIC, setpass: FlashcardAccessType.SETPASS, userId });
    } else {
      qb.andWhere('set.accessType = :public', { public: FlashcardAccessType.PUBLIC });
    }

    return qb.getOne();
  }

  async findById(id: string): Promise<FlashcardSet | null> {
    return this.repository.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateFlashcardSetDto, userId: string): Promise<FlashcardSet> {
    const result = await this.repository.update({ id, userId }, dto);
    if (result.affected === 0) {
      throw new NotFoundException('Flashcard set not found');
    }
    const updated = await this.repository.findOne({ where: { id, userId } });
    if (!updated) throw new NotFoundException('Flashcard set not found');
    return updated;
  }

  async remove(id: string, userId: string): Promise<void> {
    const res = await this.repository.delete({ id, userId });
    if (res.affected === 0) throw new NotFoundException('Flashcard set not found');
  }
}