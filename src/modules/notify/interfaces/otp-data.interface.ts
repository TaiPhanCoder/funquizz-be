export interface OtpData {
  email: string;
  code: string;
  type: 'email_verification' | 'password_reset';
  createdAt: Date;
}