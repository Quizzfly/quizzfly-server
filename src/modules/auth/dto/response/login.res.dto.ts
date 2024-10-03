import { NumberField, StringField } from '@core/decorators/field.decorators';

export class LoginResDto {
  @StringField()
  userId!: string;

  @StringField()
  accessToken!: string;

  @StringField()
  refreshToken!: string;

  @NumberField()
  tokenExpires!: number;
}
