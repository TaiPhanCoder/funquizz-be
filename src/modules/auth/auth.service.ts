import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../user/user.repository';
import { OtpRepository } from './otp.repository';
import { MailerService } from '../../common/services/mailer.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { email, username, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const existingUsername = await this.userRepository.findByUsername(username);
    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await this.userRepository.create({
      email,
      username,
      password: hashedPassword,
      isActive: true,
      isEmailVerified: false,
    });

    // Generate and send OTP
    await this.sendVerificationOtp(email);

    return { message: 'User registered successfully. Please check your email for verification code.' };
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; user: Partial<User> }> {
    const { email, password } = loginDto;

    // Find user with password
    const user = await this.userRepository.findOneWithPassword({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email, username: user.username };
    const accessToken = this.jwtService.sign(payload);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      accessToken,
      user: userWithoutPassword,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    // Generate and send OTP
    const otp = this.generateOtp();
    await this.otpRepository.create(email, otp, 'password_reset');
    await this.mailerService.sendOtpEmail(email, otp, 'reset');

    return { message: 'Password reset code sent to your email' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { email, otp, newPassword } = resetPasswordDto;

    // Verify OTP
    const validOtp = await this.otpRepository.findValidOtp(email, otp, 'password_reset');
    if (!validOtp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Check if OTP is expired
    if (validOtp.expiresAt < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.userRepository.update(user.id, { password: hashedPassword });

    // Mark OTP as used
    await this.otpRepository.markAsUsed(validOtp.id);

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    // Find user with password
    const user = await this.userRepository.findOneWithPassword({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.userRepository.update(userId, { password: hashedPassword });

    return { message: 'Password changed successfully' };
  }

  async verifyEmail(verifyOtpDto: VerifyOtpDto): Promise<{ message: string }> {
    const { email, otp } = verifyOtpDto;

    // Verify OTP
    const validOtp = await this.otpRepository.findValidOtp(email, otp, 'email_verification');
    if (!validOtp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Check if OTP is expired
    if (validOtp.expiresAt < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user email verification status
    await this.userRepository.update(user.id, { isEmailVerified: true });

    // Mark OTP as used
    await this.otpRepository.markAsUsed(validOtp.id);

    return { message: 'Email verified successfully' };
  }

  async resendVerificationOtp(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    await this.sendVerificationOtp(email);

    return { message: 'Verification code sent to your email' };
  }

  private async sendVerificationOtp(email: string): Promise<void> {
    const otp = this.generateOtp();
    await this.otpRepository.create(email, otp, 'email_verification');
    await this.mailerService.sendOtpEmail(email, otp, 'verification');
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}