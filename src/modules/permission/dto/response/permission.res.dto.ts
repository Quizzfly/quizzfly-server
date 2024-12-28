import { BaseResDto } from '@common/dto/base.res.dto';
import { ActionList, ResourceList } from '@core/constants/app.constant';
import { EnumField, StringField } from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

@Expose()
export class PermissionResDto extends BaseResDto {
  @EnumField(() => ResourceList)
  @Expose()
  resource: ResourceList;

  @EnumField(() => ActionList)
  @Expose()
  action: ActionList;

  @StringField()
  @Expose()
  name: string;

  @StringField()
  @Expose()
  description: string;
}
