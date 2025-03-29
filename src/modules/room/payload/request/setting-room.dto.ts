import {
  BooleanFieldOptional,
  StringFieldOptional,
} from '@core/decorators/field.decorators';
import { HostDto } from '@modules/room/payload/host.dto';
import { Expose } from 'class-transformer';

export class SettingRoomDto extends HostDto {
  @BooleanFieldOptional()
  @Expose({ name: 'is_show_question' })
  isShowQuestion: boolean;

  @BooleanFieldOptional()
  @Expose({ name: 'is_auto_play' })
  isAutoPlay: boolean;

  @StringFieldOptional()
  @Expose({ name: 'lobby_music' })
  lobbyMusic: string;
}
