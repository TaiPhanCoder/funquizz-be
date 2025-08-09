import { IsNotEmpty, IsString, IsOptional, IsEnum, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FlashcardDifficulty } from '../enums/flashcard-difficulty.enum';

export class CreateFlashcardDto {
  @ApiProperty({
    description: 'The question of the flashcard',
    example: 'What is the capital of France?',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    description: 'The answer to the flashcard question',
    example: 'Paris',
  })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiProperty({
    description: 'Difficulty level of the flashcard',
    enum: FlashcardDifficulty,
    example: FlashcardDifficulty.MEDIUM,
    required: false,
  })
  @IsEnum(FlashcardDifficulty)
  @IsOptional()
  difficulty?: FlashcardDifficulty;

  @ApiProperty({
    description: 'URL of the image attached to the flashcard',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsString()
  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}