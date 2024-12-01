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

export class PageOptionsDto {
  @NumberFieldOptional({
    minimum: 1,
    default: DEFAULT_PAGE_LIMIT,
    int: true,
  })
  readonly limit?: number = DEFAULT_PAGE_LIMIT;

  @NumberFieldOptional({
    minimum: 1,
    default: DEFAULT_CURRENT_PAGE,
    int: true,
  })
  readonly page?: number = DEFAULT_CURRENT_PAGE;

  @StringFieldOptional()
  readonly q?: string;

  @EnumFieldOptional(() => Order, { default: Order.ASC })
  readonly order?: Order = Order.DESC;

  get offset(): number {
    return this.page ? (this.page - 1) * this.limit : 0;
  }
}
