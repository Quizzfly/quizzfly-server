import {
  DEFAULT_CURRENT_PAGE,
  DEFAULT_PAGE_LIMIT,
  Order,
} from '@core/constants/app.constant';
import {
  EnumFieldOptional,
  NumberFieldOptional,
  StringFieldOptional,
} from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

@Expose()
export class PageOptionsDto {
  @NumberFieldOptional({
    minimum: 1,
    default: DEFAULT_PAGE_LIMIT,
    int: true,
  })
  @Expose()
  readonly limit?: number = DEFAULT_PAGE_LIMIT;

  @NumberFieldOptional({
    minimum: 1,
    default: DEFAULT_CURRENT_PAGE,
    int: true,
  })
  @Expose()
  readonly page?: number = DEFAULT_CURRENT_PAGE;

  @StringFieldOptional()
  @Expose()
  readonly q?: string;

  @EnumFieldOptional(() => Order, { default: Order.DESC })
  @Expose()
  readonly order?: Order = Order.DESC;

  @Expose()
  get offset(): number {
    return this.page ? (this.page - 1) * this.limit : 0;
  }
}
