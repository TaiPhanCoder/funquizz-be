import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Otp } from '../../database/entities/otp.entity';

@Injectable()
export class OtpRepository {
  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
  ) {}

  async create(email: string, code: string, type: string): Promise<Otp> {
    // Delete existing unused OTPs for this email and type
    await this.otpRepository.delete({
      email,
      type,
      isUsed: false,
    });

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

    const otp = this.otpRepository.create({
      email,
      code,
      type,
      expiresAt,
    });

    return this.otpRepository.save(otp);
  }

  async findValidOtp(email: string, code: string, type: string): Promise<Otp | null> {
    return this.otpRepository.findOne({
      where: {
        email,
        code,
        type,
        isUsed: false,
      },
    });
  }

  async markAsUsed(id: string): Promise<void> {
    await this.otpRepository.update(id, { isUsed: true });
  }

  async deleteExpiredOtps(): Promise<void> {
    await this.otpRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }

  async deleteOtpsByEmail(email: string, type: string): Promise<void> {
    await this.otpRepository.delete({
      email,
      type,
    });
  }
}