import { BaseResDto } from '@common/dto/base.res.dto';
import { Uuid } from '@common/types/common.type';
import {
  BooleanField,
  DateField,
  StringField,
  UUIDField,
} from '@core/decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class InfoRoomResDto extends BaseResDto {
  @Expose()
  @DateField({ name: 'start_time' })
  startTime: Date;

  @Expose()
  @DateField({ name: 'end_time' })
  endTime: Date;

  @Expose()
  @StringField({ name: 'room_pin' })
  roomPin: string;

  @Expose()
  @StringField({ name: 'room_status' })
  roomStatus: string;

  @Expose()
  @BooleanField({ name: 'is_show_question' })
  isShowQuestion: boolean;

  @Expose()
  @BooleanField({ name: 'is_auto_play' })
  isAutoPlay: boolean;

  @Expose()
  @StringField({ name: 'lobby_music' })
  lobbyMusic: string;

  @Expose()
  @UUIDField({ name: 'quizzfly_id' })
  quizzflyId: Uuid;
}
