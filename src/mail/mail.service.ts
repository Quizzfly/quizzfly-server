import { AllConfigType } from '@config/config.type';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async sendEmailVerification(email: string, token: string) {
    const url = `${this.configService.getOrThrow('app.clientUrl', { infer: true })}/auth/verify-email?token=${token}`;

    await this.mailerService
      .sendMail({
        to: email,
        subject: 'Email Verification',
        template: 'activation',
        context: {
          name: email.split('@')[0],
          verificationLink: url,
        },
      })
      .catch((err) => {
        this.logger.error('Error sending email verification');
        this.logger.error(err);
      });
  }

  async forgotPassword(email: string, token: string) {
    const url = `${this.configService.getOrThrow('app.clientUrl', { infer: true })}/auth/reset-password?token=${token}`;

    await this.mailerService
      .sendMail({
        to: email,
        subject: 'Reset your password',
        template: 'activation',
        context: {
          name: email.split('@')[0],
          verificationLink: url,
        },
      })
      .catch((err) => {
        this.logger.error('Error sending email reset password');
        this.logger.error(err);
      });
  }
}
