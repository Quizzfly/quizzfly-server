import {
  EnumField,
  NumberField,
  StringField,
} from '@core/decorators/field.decorators';
import { ResourceType } from '@modules/subscription/enum/resource-type.enum';
import { Expose } from 'class-transformer';
import { IsInt } from 'class-validator';

@Expose()
export class CreateResourceLimitReqDto {
  @StringField()
  @Expose()
  name: string;

  @Expose({ name: 'resource_type' })
  @EnumField(() => ResourceType, {
    name: 'resource_type',
    example: Object.values(ResourceType).join(' | '),
  })
  resourceType: ResourceType;

  @NumberField({ isPositive: true })
  @IsInt()
  @Expose()
  limit: number;
}
