import { ApiProperty } from '@nestjs/swagger';
import { FlashcardDifficulty } from '../../enums/flashcard-difficulty.enum';

export class FlashcardResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the flashcard',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'The question of the flashcard',
    example: 'What is the capital of France?'
  })
  question: string;

  @ApiProperty({
    description: 'The answer to the flashcard question',
    example: 'Paris'
  })
  answer: string;

  @ApiProperty({
    description: 'Category of the flashcard',
    example: 'Geography',
    nullable: true
  })
  category: string;

  @ApiProperty({
    description: 'Difficulty level of the flashcard',
    enum: FlashcardDifficulty,
    example: FlashcardDifficulty.MEDIUM,
    nullable: true
  })
  difficulty: string;

  @ApiProperty({
    description: 'Number of times this flashcard has been reviewed',
    example: 5
  })
  reviewCount: number;

  @ApiProperty({
    description: 'Last time this flashcard was reviewed',
    example: '2024-01-15T10:30:00Z',
    nullable: true
  })
  lastReviewedAt: Date;

  @ApiProperty({
    description: 'Whether the flashcard is active',
    example: true
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether the flashcard is public (visible to everyone)',
    example: false
  })
  isPublic: boolean;

  @ApiProperty({
    description: 'URL of the image attached to the flashcard',
    example: 'https://example.com/image.jpg',
    nullable: true
  })
  imageUrl?: string;

  @ApiProperty({
    description: 'ID of the user who owns this flashcard',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  userId: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00Z'
  })
  updatedAt: Date;
}