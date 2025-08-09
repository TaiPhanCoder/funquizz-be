import { Flashcard } from '../entities/flashcard.entity';
import { CreateFlashcardDto } from '../dto/create-flashcard.dto';
import { UpdateFlashcardDto } from '../dto/update-flashcard.dto';

export interface IFlashcardService {
  create(createFlashcardDto: CreateFlashcardDto, userId: string): Promise<Flashcard>;
  findAll(userId: string): Promise<Flashcard[]>;
  findOne(id: string, userId: string): Promise<Flashcard>;
  findByCategory(category: string, userId: string): Promise<Flashcard[]>;
  findByDifficulty(difficulty: string, userId: string): Promise<Flashcard[]>;
  update(id: string, updateFlashcardDto: UpdateFlashcardDto, userId: string): Promise<Flashcard>;
  remove(id: string, userId: string): Promise<void>;
  reviewFlashcard(id: string, userId: string): Promise<Flashcard>;
  findAccessibleById(id: string, userId?: string): Promise<Flashcard | null>;
}