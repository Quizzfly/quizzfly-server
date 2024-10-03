import {
  EmailField,
  PasswordField,
  StringFieldOptional,
} from '@core/decorators/field.decorators';

export class CreateUserReqDto {
  @StringFieldOptional()
  readonly name?: string;

  @EmailField()
  readonly email: string;

  @PasswordField()
  readonly password: string;
}
