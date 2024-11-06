import { StringField } from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

export class LoginWithGoogleReqDto {

  @StringField({ name: 'access_token' })
  @Expose({
    name: "access_token"
  })
  accessToken: string;
}
