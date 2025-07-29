import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { OtpData } from '../interfaces/otp-data.interface';

@Injectable()
export class OtpRepository {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  private getOtpKey(email: string, type: string): string {
    return `otp:${type}:${email}`;
  }

  async create(email: string, code: string, type: string): Promise<void> {
    const key = this.getOtpKey(email, type);
    const otpData: OtpData = {
      email,
      code,
      type: type as 'email_verification' | 'password_reset',
      createdAt: new Date(),
    };

    // Get expiry time from config (in minutes, convert to milliseconds)
    const expiryMinutes = this.configService.get<number>('app.otp.expiryMinutes', 5);
    const expiryMs = expiryMinutes * 60 * 1000;

    // Store OTP with configured expiry time
    await this.cacheManager.set(key, JSON.stringify(otpData), expiryMs);
  }

  async findValidOtp(email: string, code: string, type: string): Promise<OtpData | null> {
    const key = this.getOtpKey(email, type);
    const otpDataString = await this.cacheManager.get<string>(key);
    
    if (!otpDataString) {
      return null;
    }

    const otpData: OtpData = JSON.parse(otpDataString);
    
    // Check if the code matches
    if (otpData.code !== code) {
      return null;
    }

    return otpData;
  }

  async markAsUsed(email: string, type: string): Promise<void> {
    const key = this.getOtpKey(email, type);
    await this.cacheManager.del(key);
  }

  async deleteOtpsByEmail(email: string, type: string): Promise<void> {
    const key = this.getOtpKey(email, type);
    await this.cacheManager.del(key);
  }

  async deleteExpiredOtps(): Promise<void> {
    // Redis automatically handles expiration, so this method is not needed
    // but kept for interface compatibility
  }
}