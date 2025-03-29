import { EmailField } from '@core/decorators/field.decorators';

export class EmailDto {
  @EmailField()
  email: string;
}
