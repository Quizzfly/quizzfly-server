import { BaseResDto } from '@common/dto/base.res.dto';
import { Uuid } from '@common/types/common.type';
import {
  BooleanField,
  ClassFieldOptional,
  DateField,
  NumberField,
  StringField,
  UUIDField,
} from '@core/decorators/field.decorators';
import { Expose, Transform } from 'class-transformer';

@Expose()
class BaseQuizzflyRes {
  @UUIDField()
  @Expose()
  id: Uuid;

  @UUIDField()
  @Expose()
  title: string;
}

@Expose()
export class RoomReportResDto extends BaseResDto {
  @DateField({ name: 'start_time' })
  @Expose()
  startTime: Date;

  @DateField({ name: 'end_time' })
  @Expose()
  endTime: Date;

  @StringField({ name: 'room_pin' })
  @Expose()
  roomPin: string;

  @StringField({ name: 'room_status' })
  @Expose()
  roomStatus: string;

  @BooleanField({ name: 'is_show_question' })
  @Expose()
  isShowQuestion: boolean;

  @BooleanField({ name: 'is_auto_play' })
  @Expose()
  isAutoPlay: boolean;

  @StringField({ name: 'lobby_music' })
  @Expose()
  lobbyMusic: string;

  @NumberField({ name: 'participant_count' })
  @Expose()
  participantCount: number;

  @NumberField({ name: 'question_count' })
  @Expose()
  questionCount: number;

  @ClassFieldOptional(() => BaseQuizzflyRes)
  @Transform(({ obj }) => {
    return obj.quizzflyId && obj.quizzflyTitle
      ? { id: obj.quizzflyId, title: obj.quizzflyTitle }
      : null;
  })
  @Expose()
  quizzfly: BaseQuizzflyRes;
}
