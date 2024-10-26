import { Uuid } from '@common/types/common.type';
import {
  BooleanField,
  StringField,
  UUIDField,
} from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

export class CreateRoomReqDto {
  @UUIDField({
    name: 'quizzfly_id',
  })
  @Expose({
    name: 'quizzfly_id',
  })
  quizzflyId: Uuid;

  @BooleanField({
    name: 'is_show_question',
  })
  @Expose({
    name: 'is_show_question',
  })
  isShowQuestion: boolean;

  @BooleanField({
    name: 'is_auto_play',
  })
  @Expose({
    name: 'is_auto_play',
  })
  isAutoPlay: boolean;

  @StringField({
    name: 'lobby_music',
  })
  @Expose({
    name: 'lobby_music',
  })
  lobbyMusic: string;
}
