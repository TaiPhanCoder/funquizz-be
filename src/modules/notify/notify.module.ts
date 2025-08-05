import { Module } from '@nestjs/common';
import { OtpRepository } from './repositories/otp.repository';
import { OtpService } from './services/otp.service';
import { MailerService } from '../../common/services/mailer.service';
import { RedisModule } from '../../config/redis.module';

@Module({
  imports: [RedisModule],
  providers: [OtpRepository, OtpService, MailerService],
  exports: [OtpRepository, OtpService],
})
export class NotifyModule {}