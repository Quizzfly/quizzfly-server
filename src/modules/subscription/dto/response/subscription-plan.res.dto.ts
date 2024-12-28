import { BaseResDto } from '@common/dto/base.res.dto';
import { NumberField, StringField } from '@core/decorators/field.decorators';
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
}
