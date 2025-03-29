import { PasswordField, TokenField } from '@core/decorators/field.decorators';
import { MatchPassword } from '@core/decorators/validators/match-password.decorator';

export class AuthResetPasswordDto {
  @PasswordField()
  password!: string;

  @PasswordField()
  @MatchPassword('password')
  confirm_password!: string;

  @TokenField()
  token!: string;
}
