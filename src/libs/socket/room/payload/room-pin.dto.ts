import { StringField } from '@core/decorators/field.decorators';

export class RoomPinDto {
  @StringField()
  roomPin: string;
}
