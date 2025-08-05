import { ApiProperty } from '@nestjs/swagger';
export class UserResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com'
  })
  email: string;

  @ApiProperty({
    description: 'The username of the user',
    example: 'johndoe'
  })
  username: string;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true
  })
  isActive: boolean;
}