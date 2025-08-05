import { registerAs } from '@nestjs/config';

export default registerAs('mailer', () => ({
  transport: {
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.EMAIL_APP_PASS, // App password for Gmail
    },
  },
  defaults: {
    from: `"${process.env.MAIL_FROM_NAME || 'FunQuizz'}" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
  },
}));