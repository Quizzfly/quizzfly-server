import { Uuid } from '@common/types/common.type';
import {
  StringField,
  UUIDFieldOptional,
} from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

export class JoinRoomDto {
  @StringField()
  @Expose({ name: 'room_pin' })
  roomPin: string;

  @UUIDFieldOptional()
  @Expose({ name: 'user_id' })
  userId?: Uuid;

  @StringField()
  @Expose({ name: 'nick_name' })
  nickName: string;
}
