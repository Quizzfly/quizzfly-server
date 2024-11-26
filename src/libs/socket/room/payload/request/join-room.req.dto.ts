import {
  StringField,
  UUIDFieldOptional,
} from '@core/decorators/field.decorators';

export class JoinRoomReqDto {
  @StringField()
  roomPin: string;

  @UUIDFieldOptional()
  userId?: string;

  @StringField()
  name: string;
}
