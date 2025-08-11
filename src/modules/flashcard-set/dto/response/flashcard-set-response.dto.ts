import { ApiProperty } from '@nestjs/swagger';

export class FlashcardSetResponseDto {
  @ApiProperty({ description: 'Unique identifier of the flashcard set' })
  id: string;

  @ApiProperty({ description: 'Name of the flashcard set' })
  name: string;

  @ApiProperty({ description: 'Description of the set', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Access type of the set', enum: ['public','private','setpass'] })
  accessType: string;

  @ApiProperty({ description: 'Owner user id' })
  userId: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Update timestamp' })
  updatedAt: Date;
}