import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashcardService } from './flashcard.service';
import { FlashcardController } from './flashcard.controller';
import { FlashcardRepository } from './flashcard.repository';
import { Flashcard } from './entities/flashcard.entity';
import { FlashcardSetModule } from '../flashcard-set/flashcard-set.module';

@Module({
  imports: [TypeOrmModule.forFeature([Flashcard]), FlashcardSetModule],
  controllers: [FlashcardController],
  providers: [FlashcardService, FlashcardRepository],
  exports: [FlashcardService, FlashcardRepository],
})
export class FlashcardModule {}