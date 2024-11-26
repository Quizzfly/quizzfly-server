import { StringField, UUIDField } from '@core/decorators/field.decorators';

export class CreateRoomReqDto {
  @StringField()
  roomPin: string;

  @UUIDField()
  userId: string;

  @StringField()
  name: string;
}
