import { PartialType } from '@nestjs/swagger';
import { CreateFlashcardSetDto } from './create-flashcard-set.dto';

export class UpdateFlashcardSetDto extends PartialType(CreateFlashcardSetDto) {
  // allow null to clear password when switching away from SETPASS
  accessPassword?: string;
}