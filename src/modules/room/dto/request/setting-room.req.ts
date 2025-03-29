import {
  BooleanFieldOptional,
  StringFieldOptional,
} from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

export class SettingRoomReqDto {
  @BooleanFieldOptional({
    name: 'is_show_question',
  })
  @Expose({
    name: 'is_show_question',
  })
  isShowQuestion: boolean;

  @BooleanFieldOptional({
    name: 'is_auto_play',
  })
  @Expose({
    name: 'is_auto_play',
  })
  isAutoPlay: boolean;

  @StringFieldOptional({
    name: 'lobby_music',
  })
  @Expose({
    name: 'lobby_music',
  })
  lobbyMusic: string;
}
