import { NumberField, StringField } from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

export class WebhookPaymentUpdateReqDto {
  @NumberField()
  amount: number;

  @StringField()
  description: string;

  @StringField({ name: 'transaction_time' })
  @Expose({ name: 'transaction_time' })
  transactionTime: string;
}
