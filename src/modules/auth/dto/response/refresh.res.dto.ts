import { NumberField, StringField } from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

export class RefreshResDto {
  @Expose({ name: 'access_token' })
  @StringField()
  accessToken!: string;

  @Expose({ name: 'refresh_token' })
  @StringField()
  refreshToken!: string;

  @Expose({ name: 'token_expires' })
  @NumberField()
  tokenExpires!: number;
}
