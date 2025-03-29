import {
  StringField,
  StringFieldOptional,
} from '@core/decorators/field.decorators';

export class CreateGroupReqDto {
  @StringField()
  name: string;

  @StringFieldOptional()
  description?: string;

  @StringFieldOptional()
  background?: string;
}
