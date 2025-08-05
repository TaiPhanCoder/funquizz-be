import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../user/user.repository';
import { OtpRepository } from '../notify/repositories/otp.repository';
import { MailerService } from '../../common/services/mailer.service';
import { RegisterDto } from './dto/request/register.dto';
import { LoginDto } from './dto/request/login.dto';
import { ForgotPasswordDto } from './dto/request/forgot-password.dto';
import { VerifyOtpDto } from './dto/request/verify-otp.dto';
import { ResetPasswordDto } from './dto/request/reset-password.dto';
import { ChangePasswordDto } from './dto/request/change-password.dto';
import { RefreshTokenDto } from './dto/request/refresh-token.dto';
import { AuthResponseDto } from './dto/response/auth-response.dto';
import { RefreshTokenResponseDto } from './dto/response/refresh-token-response.dto';
import { MessageResponseDto } from './dto/response/message-response.dto';
import { UserResponseDto } from './dto/response/user-response.dto';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
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
    const user = await this.userRepository.create({
      email,
      username,
      password: hashedPassword,
    });

    // Generate and send OTP
    await this.sendVerificationOtp(email);

    // Find and return user with token
    const createdUser = await this.userRepository.findOneWithPassword(email);
    if (!createdUser) {
      throw new NotFoundException('User not found');
    }

    // Generate JWT tokens
    const payload = { sub: createdUser.id };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('app.jwt.secret'),
      expiresIn: this.configService.get('app.jwt.expiresIn'),
    });
    
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('app.jwt.refreshSecret'),
      expiresIn: this.configService.get('app.jwt.refreshExpiresIn'),
    });

    // Store refresh token in Redis
    const refreshExpiresIn = this.parseExpirationTime(this.configService.get('app.jwt.refreshExpiresIn') || '7d');
    await this.refreshTokenRepository.create(createdUser.id, refreshToken, refreshExpiresIn);

    return {
      user: this.toUserResponse(createdUser),
      token: {
        accessToken,
        refreshToken,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { identifier, password } = loginDto;

    // Find user with password
    const user = await this.userRepository.findOneWithPassword(identifier);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT tokens
    const payload = { sub: user.id };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('app.jwt.secret'),
      expiresIn: this.configService.get('app.jwt.expiresIn'),
    });
    
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('app.jwt.refreshSecret'),
      expiresIn: this.configService.get('app.jwt.refreshExpiresIn'),
    });

    // Store refresh token in Redis
    const refreshExpiresIn = this.parseExpirationTime(this.configService.get('app.jwt.refreshExpiresIn') || '7d');
    await this.refreshTokenRepository.create(user.id, refreshToken, refreshExpiresIn);

    return {
      user: this.toUserResponse(user),
      token: {
        accessToken,
        refreshToken,
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<MessageResponseDto> {
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

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<MessageResponseDto> {
    const { email, otp, newPassword } = resetPasswordDto;

    // Verify OTP
    const validOtp = await this.otpRepository.findValidOtp(email, otp, 'password_reset');
    if (!validOtp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // OTP expiry is handled by Redis TTL, no need to check manually

    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.userRepository.update(user.id, { password: hashedPassword });

    // Mark OTP as used (delete from Redis)
    await this.otpRepository.markAsUsed(email, 'password_reset');

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<MessageResponseDto> {
    const { currentPassword, newPassword } = changePasswordDto;

    // Find user with password
    const user = await this.userRepository.findOneWithPassword(userId);
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

  async verifyEmail(verifyOtpDto: VerifyOtpDto): Promise<MessageResponseDto> {
    const { email, otp } = verifyOtpDto;

    // Verify OTP
    const validOtp = await this.otpRepository.findValidOtp(email, otp, 'email_verification');
    if (!validOtp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // OTP expiry is handled by Redis TTL, no need to check manually

    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Mark user as active (verified)
    await this.userRepository.update(user.id, { isActive: true });

    // Mark OTP as used (delete from Redis)
    await this.otpRepository.markAsUsed(email, 'email_verification');

    return { message: 'Email verified successfully' };
  }

  async resendVerificationOtp(email: string): Promise<MessageResponseDto> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    await this.sendVerificationOtp(email);

    return { message: 'Verification code sent to your email' };
  }

  private async sendVerificationOtp(email: string): Promise<void> {
    const otp = this.generateOtp();
    await this.otpRepository.create(email, otp, 'email_verification');
    await this.mailerService.sendOtpEmail(email, otp, 'verification');
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    const { refreshToken } = refreshTokenDto;

    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('app.jwt.refreshSecret'),
      });

      // Check if refresh token exists in Redis
      const storedToken = await this.refreshTokenRepository.findByUserId(payload.sub);
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const newPayload = { sub: payload.sub };
      const accessToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get('app.jwt.secret'),
        expiresIn: this.configService.get('app.jwt.expiresIn'),
      });
      
      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get('app.jwt.refreshSecret'),
        expiresIn: this.configService.get('app.jwt.refreshExpiresIn'),
      });

      // Update refresh token in Redis
      const refreshExpiresIn = this.parseExpirationTime(this.configService.get('app.jwt.refreshExpiresIn') || '7d');
      await this.refreshTokenRepository.create(payload.sub, newRefreshToken, refreshExpiresIn);

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<MessageResponseDto> {
    // Remove refresh token from Redis
    await this.refreshTokenRepository.delete(userId);
    return { message: 'Logged out successfully' };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private parseExpirationTime(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));
    
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return value;
    }
  }

  private toUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      isActive: user.isActive,
    };
  }
}