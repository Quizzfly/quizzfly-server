import { NumberField, StringField } from '@core/decorators/field.decorators';

export class LoginResDto {
  @StringField({ name: 'user_id' })
  userId!: string;

  @StringField({ name: 'access_token' })
  accessToken!: string;

  @StringField({ name: 'refresh_token' })
  refreshToken!: string;

  @NumberField({ name: 'token_expires' })
  tokenExpires!: number;
}
