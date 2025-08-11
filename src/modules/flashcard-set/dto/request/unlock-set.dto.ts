import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UnlockSetDto {
  @ApiProperty({
    description: 'Password to unlock the flashcard set',
    example: 'mypassword123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}