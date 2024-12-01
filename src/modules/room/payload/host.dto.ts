import { Uuid } from '@common/types/common.type';
import { StringField, UUIDField } from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

export class HostDto {
  @UUIDField()
  @Expose({ name: 'host_id' })
  hostId: Uuid;

  @StringField()
  @Expose({ name: 'room_pin' })
  roomPin: string;
}
