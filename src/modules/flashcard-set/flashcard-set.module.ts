import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashcardSet } from './entities/flashcard-set.entity';
import { FlashcardSetService } from './flashcard-set.service';
import { FlashcardSetController } from './flashcard-set.controller';
import { FlashcardSetRepository } from './flashcard-set.repository';
import { AccessControlService } from './services/access-control.service';
import { RedisModule } from '../../config/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([FlashcardSet]), RedisModule],
  controllers: [FlashcardSetController],
  providers: [FlashcardSetService, FlashcardSetRepository, AccessControlService],
  exports: [FlashcardSetService, FlashcardSetRepository, AccessControlService],
})
export class FlashcardSetModule {}