import { StringField } from '@core/decorators/field.decorators';

export class KickPlayerReqDto {
  @StringField()
  roomPin: string;

  @StringField()
  socketId: string;
}
