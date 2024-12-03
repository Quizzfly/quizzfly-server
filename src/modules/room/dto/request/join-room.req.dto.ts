import { Uuid } from '@common/types/common.type';
import {
  StringField,
  StringFieldOptional,
  UUIDField,
  UUIDFieldOptional,
} from '@core/decorators/field.decorators';

export class JoinRoomReqDto {
  @StringFieldOptional()
  socketId: string;

  @UUIDFieldOptional()
  userId?: Uuid;

  @StringField()
  nickName: string;

  @UUIDField()
  roomId: Uuid;

  @StringField()
  roomPin: string;
}
