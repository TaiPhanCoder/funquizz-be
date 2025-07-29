import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserRepository } from '../user/user.repository';
import { OtpRepository } from './otp.repository';
import { MailerService } from '../../common/services/mailer.service';
import { User } from '../../database/entities/user.entity';
import { Otp } from '../../database/entities/otp.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Otp]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    UserRepository,
    OtpRepository,
    MailerService,
  ],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}