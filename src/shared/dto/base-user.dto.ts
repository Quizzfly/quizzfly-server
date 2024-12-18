import { Uuid } from '@common/types/common.type';
import { StringField, UUIDField } from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

@Expose()
export class BaseUserDto {
  @UUIDField()
  @Expose()
  id: Uuid;

  @StringField()
  @Expose()
  email: string;

  @StringField()
  @Expose()
  username: string;

  @StringField()
  @Expose()
  name: string;

  @StringField()
  @Expose()
  avatar: string;
}
