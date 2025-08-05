import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserRepository } from '../user/user.repository';
import { OtpRepository } from '../notify/repositories/otp.repository';
import { MailerService } from '../../common/services/mailer.service';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { User } from '../user/entities/user.entity';
import { NotifyModule } from '../notify/notify.module';
import { RedisModule } from '../../config/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    NotifyModule,
    RedisModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('app.jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('app.jwt.expiresIn'),
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
    RefreshTokenRepository,
  ],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}