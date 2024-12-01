import { Uuid } from '@common/types/common.type';
import {
  StringField,
  StringFieldOptional,
  UUIDField,
} from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

export class CreateRoomDto {
  @UUIDField()
  @Expose({ name: 'room_id' })
  roomId: Uuid;

  @StringField()
  @Expose({ name: 'room_pin' })
  roomPin: string;

  @UUIDField()
  @Expose({ name: 'user_id' })
  userId: Uuid;

  @StringFieldOptional()
  name?: string;
}
