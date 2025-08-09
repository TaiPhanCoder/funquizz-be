import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashcardService } from './flashcard.service';
import { FlashcardController } from './flashcard.controller';
import { FlashcardRepository } from './flashcard.repository';
import { Flashcard } from './entities/flashcard.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Flashcard])],
  controllers: [FlashcardController],
  providers: [FlashcardService, FlashcardRepository],
  exports: [FlashcardService, FlashcardRepository],
})
export class FlashcardModule {}