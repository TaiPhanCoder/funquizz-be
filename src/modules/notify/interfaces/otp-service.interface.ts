export interface IOtpService {
  generateOtp(): string;
  sendVerificationOtp(email: string): Promise<void>;
  sendPasswordResetOtp(email: string): Promise<void>;
  verifyOtp(email: string, otp: string, type: 'email_verification' | 'password_reset'): Promise<boolean>;
  markOtpAsUsed(email: string, type: 'email_verification' | 'password_reset'): Promise<void>;
}