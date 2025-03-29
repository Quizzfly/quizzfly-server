import {
  EmailField,
  PasswordField,
  StringFieldOptional,
} from '@core/decorators/field.decorators';
import { MatchPassword } from '@core/decorators/validators/match-password.decorator';

export class RegisterReqDto {
  @EmailField()
  email!: string;

  @StringFieldOptional()
  name: string;

  @PasswordField()
  password!: string;

  @PasswordField()
  @MatchPassword('password')
  confirm_password!: string;
}
