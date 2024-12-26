import {
  StringField,
  StringFieldOptional,
} from '@core/decorators/field.decorators';

export class CreateRoleDto {
  @StringField()
  name: string;

  @StringFieldOptional()
  description?: string;
}
