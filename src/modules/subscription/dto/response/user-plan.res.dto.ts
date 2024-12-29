import { BaseResDto } from '@common/dto/base.res.dto';
import {
  DateField,
  NumberField,
  StringField,
} from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

@Expose()
export class UserPlanResDto extends BaseResDto {
  @NumberField()
  @Expose()
  amount: number;

  @StringField()
  @Expose()
  description: string;

  @StringField()
  @Expose()
  code: string;

  @StringField()
  @Expose()
  userPlanStatus: string;

  @DateField()
  @Expose()
  paymentedAt: Date;

  @DateField()
  @Expose()
  subscriptionExpiredAt: Date;
}
