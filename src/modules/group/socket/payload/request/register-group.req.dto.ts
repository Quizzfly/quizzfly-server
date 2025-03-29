import { StringField } from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

export class RegisterGroupReqDto {
  @StringField({ isArray: true, each: true })
  @Expose({
    name: 'group_ids',
  })
  groupIds: string[];
}
