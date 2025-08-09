import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashcardSet } from './entities/flashcard-set.entity';
import { FlashcardSetService } from './flashcard-set.service';
import { FlashcardSetController } from './flashcard-set.controller';
import { FlashcardSetRepository } from './flashcard-set.repository';

@Module({
  imports: [TypeOrmModule.forFeature([FlashcardSet])],
  controllers: [FlashcardSetController],
  providers: [FlashcardSetService, FlashcardSetRepository],
  exports: [FlashcardSetService, FlashcardSetRepository],
})
export class FlashcardSetModule {}