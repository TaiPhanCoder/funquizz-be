import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { FlashcardRepository } from '../flashcard.repository';

@Injectable()
export class FlashcardAccessGuard implements CanActivate {
  constructor(
    @Inject(FlashcardRepository)
    private readonly flashcardRepository: FlashcardRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const flashcardId = request.params.id;
    
    if (!flashcardId) {
      throw new NotFoundException('Flashcard ID is required');
    }

    // Get userId from JWT (if authenticated)
    const userId = request.user?.sub || null;

    // Check if flashcard is accessible
    const flashcard = await this.flashcardRepository.findAccessibleById(
      flashcardId,
      userId,
    );

    if (!flashcard) {
      throw new NotFoundException('Flashcard not found or access denied');
    }

    // Attach flashcard to request for use in controller
    request.flashcard = flashcard;
    
    return true;
  }
}