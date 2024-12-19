import { Order } from '@core/constants/app.constant';
import { EnumFieldOptional } from '@core/decorators/field.decorators';
import { ParticipantSortProperty } from '@modules/room/enums/participant-sort-property.enum';
import { Expose } from 'class-transformer';

@Expose()
export class GetParticipantReqDto {
  @EnumFieldOptional(() => ParticipantSortProperty, {
    default: ParticipantSortProperty.CREATED_AT,
    name: 'sort_by',
  })
  @Expose({ name: 'sort_by' })
  readonly sortBy: ParticipantSortProperty;

  @EnumFieldOptional(() => Order, { default: Order.DESC })
  @Expose()
  readonly order?: Order = Order.DESC;
}
