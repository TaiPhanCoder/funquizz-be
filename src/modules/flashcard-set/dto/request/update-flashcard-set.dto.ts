import { PartialType } from '@nestjs/swagger';
import { CreateFlashcardSetDto } from './create-flashcard-set.dto';

export class UpdateFlashcardSetDto extends PartialType(CreateFlashcardSetDto) {}