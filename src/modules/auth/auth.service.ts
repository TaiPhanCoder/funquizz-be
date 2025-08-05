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
import { UserService } from '../user/user.service';
import { OtpService } from '../notify/services/otp.service';
import { TokenService } from './services/token.service';
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
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly otpService: OtpService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, username, password } = registerDto;

    // Create user
    const user = await this.userService.create({
      email,
      username, 
      password,
    });

    // Generate and send OTP
    await this.otpService.sendVerificationOtp(email);

    // Find and return user with token
    const createdUser = await this.userService.findOneWithPassword(email);
    if (!createdUser) {
      throw new NotFoundException('User not found');
    }

    // Generate JWT tokens
    const payload = { sub: createdUser.id };
    const { accessToken, refreshToken } = this.tokenService.generateTokenPair(payload);

    // Store refresh token in Redis
    const refreshExpiresIn = this.tokenService.parseExpirationTime('7d');
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
    const user = await this.userService.findOneWithPassword(identifier);
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
    const { accessToken, refreshToken } = this.tokenService.generateTokenPair(payload);

    // Store refresh token in Redis
    const refreshExpiresIn = this.tokenService.parseExpirationTime('7d');
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

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    // Generate and send OTP
    await this.otpService.sendPasswordResetOtp(email);

    return { message: 'Password reset code sent to your email' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<MessageResponseDto> {
    const { email, otp, newPassword } = resetPasswordDto;

    // Verify OTP
    const isValidOtp = await this.otpService.verifyOtp(email, otp, 'password_reset');
    if (!isValidOtp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Find user
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.userService.updateUser(user.id, { password: hashedPassword });

    // Mark OTP as used (delete from Redis)
    await this.otpService.markOtpAsUsed(email, 'password_reset');

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<MessageResponseDto> {
    const { currentPassword, newPassword } = changePasswordDto;

    // Find user with password
    const user = await this.userService.findOneWithPassword(userId);
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
    await this.userService.updateUser(userId, { password: hashedPassword });

    return { message: 'Password changed successfully' };
  }

  async verifyEmail(verifyOtpDto: VerifyOtpDto): Promise<MessageResponseDto> {
    const { email, otp } = verifyOtpDto;

    // Verify OTP
    const isValidOtp = await this.otpService.verifyOtp(email, otp, 'email_verification');
    if (!isValidOtp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Find user
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Mark user as active (verified)
    await this.userService.updateUser(user.id, { isActive: true });

    // Mark OTP as used (delete from Redis)
    await this.otpService.markOtpAsUsed(email, 'email_verification');

    return { message: 'Email verified successfully' };
  }

  async resendVerificationOtp(email: string): Promise<MessageResponseDto> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    await this.otpService.sendVerificationOtp(email);

    return { message: 'Verification code sent to your email' };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    const { refreshToken } = refreshTokenDto;

    try {
      // Verify refresh token
      const payload = this.tokenService.verifyRefreshToken(refreshToken);

      // Check if refresh token exists in Redis
      const storedToken = await this.refreshTokenRepository.findByUserId(payload.sub);
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const newPayload = { sub: payload.sub };
      const { accessToken, refreshToken: newRefreshToken } = this.tokenService.generateTokenPair(newPayload);

      // Update refresh token in Redis
      const refreshExpiresIn = this.tokenService.parseExpirationTime('7d');
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

  private toUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      isActive: user.isActive,
    };
  }
}