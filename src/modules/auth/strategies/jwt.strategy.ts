import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../../user/user.repository';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('app.jwt.secret') || 'your-super-secret-jwt-key',
    });
  }

  async validate(payload: any) {
    console.log('JWT Strategy - Validating token payload:', payload);
    
    const user = await this.userRepository.findOne(payload.sub);
    console.log('JWT Strategy - Found user:', user);
    
    if (!user) {
      console.log('JWT Strategy - User not found, throwing UnauthorizedException');
      throw new UnauthorizedException();
    }
    
    const result = { sub: user.id, email: user.email, username: user.username };
    console.log('JWT Strategy - Validation successful, returning:', result);
    return result;
  }
}