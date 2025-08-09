import { Injectable, NotFoundException } from '@nestjs/common';
import { Flashcard } from './entities/flashcard.entity';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';
import { FlashcardRepository } from './flashcard.repository';
import { IFlashcardService } from './interfaces/flashcard-service.interface';
import { FlashcardDifficulty } from './enums/flashcard-difficulty.enum';

@Injectable()
export class FlashcardService implements IFlashcardService {
  constructor(
    private readonly flashcardRepository: FlashcardRepository,
  ) {}

  async create(createFlashcardDto: CreateFlashcardDto, userId: string): Promise<Flashcard> {
    return this.flashcardRepository.create(createFlashcardDto, userId);
  }

  async findAll(userId: string): Promise<Flashcard[]> {
    return this.flashcardRepository.findAll(userId);
  }

  async findOne(id: string, userId: string): Promise<Flashcard> {
    const flashcard = await this.flashcardRepository.findOne(id, userId);
    if (!flashcard) {
      throw new NotFoundException('Flashcard not found');
    }
    return flashcard;
  }

  async findByCategory(category: string, userId: string): Promise<Flashcard[]> {
    return this.flashcardRepository.findByCategory(category, userId);
  }

  async findByDifficulty(difficulty: FlashcardDifficulty, userId: string): Promise<Flashcard[]> {
    return this.flashcardRepository.findByDifficulty(difficulty, userId);
  }

  async update(id: string, updateFlashcardDto: UpdateFlashcardDto, userId: string): Promise<Flashcard> {
    const flashcard = await this.findOne(id, userId);
    return this.flashcardRepository.update(id, updateFlashcardDto, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId); // Check if exists
    await this.flashcardRepository.remove(id, userId);
  }

  async reviewFlashcard(id: string, userId: string): Promise<Flashcard> {
    const flashcard = await this.findOne(id, userId);
    return this.flashcardRepository.incrementReviewCount(id, userId);
  }

  async findAccessibleById(id: string, userId?: string): Promise<Flashcard | null> {
    return this.flashcardRepository.findAccessibleById(id, userId);
  }
}