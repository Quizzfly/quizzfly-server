import { BaseResDto } from '@common/dto/base.res.dto';
import {
  ClassFieldOptional,
  NumberField,
  StringField,
} from '@core/decorators/field.decorators';
import { ResourceLimitResDto } from '@modules/subscription/dto/response/resource-limit.res.dto';
import { Expose } from 'class-transformer';

@Expose()
export class SubscriptionPlanResDto extends BaseResDto {
  @StringField()
  @Expose()
  name: string;

  @StringField()
  @Expose()
  description: string;

  @NumberField()
  @Expose()
  duration: number;

  @NumberField()
  @Expose()
  price: number;

  @ClassFieldOptional(() => ResourceLimitResDto, {
    isArray: true,
    each: true,
    name: 'resource_limits',
  })
  @Expose({ name: 'resource_limits' })
  resourceLimits: ResourceLimitResDto[];
}
