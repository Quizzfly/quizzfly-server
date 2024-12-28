import { BaseResDto } from '@common/dto/base.res.dto';
import {
  EnumField,
  NumberField,
  StringField,
} from '@core/decorators/field.decorators';
import { ResourceType } from '@modules/subscription/enum/resource-type.enum';
import { Expose } from 'class-transformer';

@Expose()
export class ResourceLimitResDto extends BaseResDto {
  @StringField()
  @Expose()
  name: string;

  @EnumField(() => ResourceType, {
    name: 'resource_type',
    example: Object.values(ResourceType).join(' | '),
  })
  @Expose()
  resourceType: ResourceType;

  @NumberField()
  @Expose()
  limit: number;
}
