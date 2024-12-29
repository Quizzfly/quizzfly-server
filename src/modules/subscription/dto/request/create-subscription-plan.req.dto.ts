import {
  ClassFieldOptional,
  NumberField,
  StringField,
} from '@core/decorators/field.decorators';
import { CreateResourceLimitReqDto } from '@modules/subscription/dto/request/create-resource-limit.req.dto';
import { Expose } from 'class-transformer';
import { IsInt } from 'class-validator';

@Expose()
export class CreateSubscriptionPlanReqDto {
  @StringField()
  @Expose()
  name: string;

  @StringField()
  @Expose()
  description: string;

  @NumberField({ isPositive: true })
  @IsInt()
  @Expose()
  duration: number;

  @NumberField({ min: 0 })
  @Expose()
  price: number;

  @ClassFieldOptional(() => CreateResourceLimitReqDto, {
    isArray: true,
    each: true,
    name: 'resource_limits',
  })
  @Expose({ name: 'resource_limits' })
  resourceLimits: CreateResourceLimitReqDto[];
}
