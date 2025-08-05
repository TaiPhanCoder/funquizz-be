import { Injectable } from '@nestjs/common';
import { IOtpService } from '../interfaces/otp-service.interface';
import { OtpRepository } from '../repositories/otp.repository';
import { MailerService } from '../../../common/services/mailer.service';

@Injectable()
export class OtpService implements IOtpService {
  constructor(
    private readonly otpRepository: OtpRepository,
    private readonly mailerService: MailerService,
  ) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendVerificationOtp(email: string): Promise<void> {
    const otp = this.generateOtp();
    await this.otpRepository.create(email, otp, 'email_verification');
    await this.mailerService.sendOtpEmail(email, otp, 'verification');
  }

  async sendPasswordResetOtp(email: string): Promise<void> {
    const otp = this.generateOtp();
    await this.otpRepository.create(email, otp, 'password_reset');
    await this.mailerService.sendOtpEmail(email, otp, 'reset');
  }

  async verifyOtp(email: string, otp: string, type: 'email_verification' | 'password_reset'): Promise<boolean> {
    const validOtp = await this.otpRepository.findValidOtp(email, otp, type);
    return !!validOtp;
  }

  async markOtpAsUsed(email: string, type: 'email_verification' | 'password_reset'): Promise<void> {
    await this.otpRepository.markAsUsed(email, type);
  }
}