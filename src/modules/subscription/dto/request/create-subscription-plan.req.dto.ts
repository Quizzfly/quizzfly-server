import { NumberField, StringField } from '@core/decorators/field.decorators';

export class CreateSubscriptionPlanReqDto {
  @StringField()
  name: string;

  @StringField()
  description: string;

  @NumberField()
  duration: number;

  @NumberField()
  price: number;
}
