import { BaseResDto } from '@common/dto/base.res.dto';
import { Uuid } from '@common/types/common.type';
import {
  DateField,
  DateFieldOptional,
  NumberField,
  StringField,
  StringFieldOptional,
  UUIDField,
} from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

@Expose()
export class ParticipantResDto extends BaseResDto {
  @StringFieldOptional({ name: 'socket_id' })
  @Expose()
  socketId?: string;

  @StringField({ name: 'nick_name' })
  @Expose()
  nickName: string;

  @UUIDField({ name: 'room_id' })
  @Expose()
  roomId!: Uuid;

  @StringField({ name: 'room_pin' })
  @Expose()
  roomPin!: string;

  @NumberField({ name: 'total_score' })
  @Expose()
  totalScore: number;

  @NumberField({ nullable: true, default: null })
  @Expose()
  rank: number;

  @DateField({ name: 'time_join' })
  @Expose()
  timeJoin: Date;

  @DateFieldOptional({ name: 'time_left', default: null })
  @Expose()
  timeLeft: Date;

  @DateFieldOptional({ name: 'time_kicked', default: null })
  @Expose()
  timeKicked: Date;

  @NumberField({ name: 'correct_count', default: 0 })
  @Expose()
  correctCount: number;

  @NumberField({ name: 'incorrect_count', default: 0 })
  @Expose()
  incorrectCount: number;

  @NumberField({ name: 'unanswered_count', default: 0 })
  @Expose()
  unansweredCount: number;
}
