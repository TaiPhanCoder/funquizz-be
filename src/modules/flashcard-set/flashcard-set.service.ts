import { Injectable, NotFoundException } from '@nestjs/common';
import { FlashcardSetRepository } from './flashcard-set.repository';
import { CreateFlashcardSetDto } from './dto/request/create-flashcard-set.dto';
import { UpdateFlashcardSetDto } from './dto/request/update-flashcard-set.dto';
import { FlashcardSet } from './entities/flashcard-set.entity';

@Injectable()
export class FlashcardSetService {
  constructor(private readonly repo: FlashcardSetRepository) {}

  create(dto: CreateFlashcardSetDto, userId: string): Promise<FlashcardSet> {
    return this.repo.create(dto, userId);
  }

  findAllByUser(userId: string): Promise<FlashcardSet[]> {
    return this.repo.findAllByUser(userId);
  }

  async findAccessibleById(id: string, userId?: string): Promise<FlashcardSet> {
    const set = await this.repo.findByIdForAccess(id, userId);
    if (!set) throw new NotFoundException('Flashcard set not found or access denied');
    return set;
  }

  update(id: string, dto: UpdateFlashcardSetDto, userId: string): Promise<FlashcardSet> {
    return this.repo.update(id, dto, userId);
  }

  remove(id: string, userId: string): Promise<void> {
    return this.repo.remove(id, userId);
  }
}