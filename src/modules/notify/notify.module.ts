import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OtpRepository } from './repositories/otp.repository';

@Module({
  imports: [ConfigModule],
  providers: [OtpRepository],
  exports: [OtpRepository],
})
export class NotifyModule {}