import {
  StringField,
  StringFieldOptional,
} from '@core/decorators/field.decorators';

export class CreateUserInfoDto {
  @StringField()
  username!: string;

  @StringFieldOptional()
  name?: string;

  @StringFieldOptional()
  avatar?: string;
}
