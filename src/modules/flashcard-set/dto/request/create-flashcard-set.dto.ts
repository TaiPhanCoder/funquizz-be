import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FlashcardAccessType } from '../../enums/flashcard-access-type.enum';

export class CreateFlashcardSetDto {
  @ApiProperty({
    description: 'The name of the flashcard set',
    example: 'Geography Basics',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Description of the flashcard set',
    example: 'A collection of flashcards covering basic geography concepts',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Access type of the set',
    enum: FlashcardAccessType,
    example: FlashcardAccessType.PRIVATE,
    required: false,
  })
  @IsEnum(FlashcardAccessType)
  @IsOptional()
  accessType?: FlashcardAccessType;

  @ApiProperty({
    description: 'Access password (plain text) if accessType is SETPASS; will be hashed',
    required: false,
  })
  @IsString()
  @IsOptional()
  accessPassword?: string;
}