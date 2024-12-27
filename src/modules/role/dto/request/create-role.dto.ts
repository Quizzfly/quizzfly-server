import { Uuid } from '@common/types/common.type';
import {
  StringField,
  StringFieldOptional,
  UUIDFieldOptional,
} from '@core/decorators/field.decorators';
import { Transform } from 'class-transformer';

export class CreateRoleDto {
  @StringField()
  name: string;

  @StringFieldOptional()
  description?: string;

  @UUIDFieldOptional({ each: true, uniqueItems: true })
  @Transform(({ obj }) => {
    return obj.permissions && typeof obj.permissions === 'string'
      ? [obj.permissions]
      : obj.permissions;
  })
  permissions?: Array<Uuid>;
}
