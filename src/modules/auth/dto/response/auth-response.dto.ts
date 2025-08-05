import { UserResponseDto } from './user-response.dto';
import { ApiProperty } from '@nestjs/swagger';
export class AuthResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({
    example: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }
  })
  token: {
    accessToken: string;
    refreshToken: string;
  };
}