import { EmailField, PasswordField } from '@core/decorators/field.decorators';

export class LoginReqDto {
  @EmailField()
  email!: string;

  @PasswordField()
  password!: string;
}
