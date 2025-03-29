import { TokenField } from '@core/decorators/field.decorators';

export class AuthConfirmEmailDto {
  @TokenField()
  token: string;
}
