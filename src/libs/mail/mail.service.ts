import { Uuid } from '@common/types/common.type';
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
    const url = `${this.configService.getOrThrow('app.clientUrl', { infer: true })}/register/confirm?token=${token}`;

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
    const url = `${this.configService.getOrThrow('app.clientUrl', { infer: true })}/password/reset?token=${token}`;

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

  async requestDeleteAccount(email: string, code: string) {
    await this.mailerService
      .sendMail({
        to: email,
        subject: 'Request delete account',
        template: 'request-delete',
        context: {
          name: email.split('@')[0],
          code: code,
        },
      })
      .catch((err) => {
        this.logger.error('Error sending email request delete account');
        this.logger.error(err);
      });
  }

  async inviteMemberToGroup(email: string, groupId: Uuid, groupName: string) {
    const url = `${this.configService.getOrThrow('app.clientUrl', { infer: true })}/groups/joined?idGroup=${groupId}`;
    await this.mailerService
      .sendMail({
        to: email,
        subject: 'Invitation to Join Our Group',
        template: 'invite-member',
        context: {
          name: email.split('@')[0],
          groupName: groupName,
          invitationLink: url,
        },
      })
      .catch((err) => {
        this.logger.error('Error sending email invite member to group');
        this.logger.error(err);
      });
  }
}
