import { Uuid } from '@common/types/common.type';
import { StringField, UUIDField } from '@core/decorators/field.decorators';

export class CreateSessionDto {
  @StringField()
  hash!: string;

  @UUIDField()
  userId!: Uuid;
}
