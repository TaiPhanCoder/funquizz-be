import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flashcard } from './entities/flashcard.entity';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';
import { IFlashcardRepository } from './interfaces/flashcard-repository.interface';
import { FlashcardDifficulty } from './enums/flashcard-difficulty.enum';

@Injectable()
export class FlashcardRepository implements IFlashcardRepository {
  constructor(
    @InjectRepository(Flashcard)
    private readonly repository: Repository<Flashcard>,
  ) {}

  async create(createFlashcardDto: CreateFlashcardDto, userId: string): Promise<Flashcard> {
    const flashcard = this.repository.create({
      ...createFlashcardDto,
      userId,
    });
    return await this.repository.save(flashcard);
  }

  async findAll(userId: string): Promise<Flashcard[]> {
    return this.repository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Flashcard | null> {
    return this.repository.findOne({
      where: { id, userId, isActive: true },
    });
  }

  async findByCategory(category: string, userId: string): Promise<Flashcard[]> {
    return this.repository.find({
      where: { category, userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findByDifficulty(difficulty: FlashcardDifficulty, userId: string): Promise<Flashcard[]> {
    return this.repository.find({
      where: { difficulty, userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateFlashcardDto: UpdateFlashcardDto, userId: string): Promise<Flashcard> {
    await this.repository.update({ id, userId }, updateFlashcardDto);
    const flashcard = await this.findOne(id, userId);
    if (!flashcard) {
      throw new NotFoundException(`Flashcard with ID ${id} not found`);
    }
    return flashcard;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.repository.update(
      { id, userId },
      { isActive: false }
    );
    if (result.affected === 0) {
      throw new NotFoundException(`Flashcard with ID ${id} not found`);
    }
  }

  async incrementReviewCount(id: string, userId: string): Promise<void> {
    await this.repository.update(
      { id, userId },
      {
        reviewCount: () => 'reviewCount + 1',
        lastReviewedAt: new Date(),
      }
    );
  }
}