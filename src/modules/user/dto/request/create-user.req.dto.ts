import {
  EmailField,
  PasswordField,
  StringFieldOptional,
} from '@core/decorators/field.decorators';

export class CreateUserDto {
  @StringFieldOptional()
  readonly name?: string;

  @EmailField()
  readonly email: string;

  @PasswordField()
  readonly password: string;
}
