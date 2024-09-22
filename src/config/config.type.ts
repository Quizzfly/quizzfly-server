import { DatabaseConfig } from '@database/config/database-config.type';
import { MailConfig } from '@mail/config/mail-config.type';
import { AuthConfig } from '@modules/auth/config/auth-config.type';
import { AppConfig } from './app-config.type';

export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
  auth: AuthConfig;
  mail: MailConfig;
};
