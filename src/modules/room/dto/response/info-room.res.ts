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
  @DateField()
  startedAt: Date;

  @Expose()
  @DateField()
  endedAt: Date;

  @Expose()
  @StringField()
  roomPin: string;

  @Expose()
  @StringField()
  roomStatus: string;

  @Expose()
  @BooleanField()
  isShowQuestion: boolean;

  @Expose()
  @BooleanField()
  isAutoPlay: boolean;

  @Expose()
  @StringField()
  lobbyMusic: string;

  @Expose()
  @UUIDField()
  quizzflyId: Uuid;
}
