import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('mailer.transport.host'),
      port: this.configService.get('mailer.transport.port'),
      secure: this.configService.get('mailer.transport.secure'),
      auth: {
        user: this.configService.get('mailer.transport.auth.user'),
        pass: this.configService.get('mailer.transport.auth.pass'),
      },
    });
  }

  async sendOtpEmail(email: string, otp: string, type: 'verification' | 'reset' = 'verification'): Promise<void> {
    const subject = type === 'verification' ? 'Email Verification Code' : 'Password Reset Code';
    const html = this.getOtpEmailTemplate(otp, type);

    await this.transporter.sendMail({
      from: this.configService.get('mailer.defaults.from'),
      to: email,
      subject,
      html,
    });
  }

  private getOtpEmailTemplate(otp: string, type: 'verification' | 'reset'): string {
    const title = type === 'verification' ? 'Email Verification' : 'Password Reset';
    const message = type === 'verification' 
      ? 'Please use the following code to verify your email address:'
      : 'Please use the following code to reset your password:';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .otp-code { font-size: 32px; font-weight: bold; color: #4CAF50; text-align: center; padding: 20px; background-color: white; border: 2px dashed #4CAF50; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>FunQuizz</h1>
            <h2>${title}</h2>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>${message}</p>
            <div class="otp-code">${otp}</div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 FunQuizz. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}