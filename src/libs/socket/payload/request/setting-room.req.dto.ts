import { Uuid } from '@common/types/common.type';
import {
  BooleanFieldOptional,
  StringField,
  StringFieldOptional,
  UUIDField,
} from '@core/decorators/field.decorators';

export class SettingRoomReqDto {
  @UUIDField()
  roomId: Uuid;

  @StringField()
  roomPin: string;

  @BooleanFieldOptional()
  isShowQuestion: boolean;

  @BooleanFieldOptional()
  isAutoPlay: boolean;

  @StringFieldOptional()
  lobbyMusic: string;
}
