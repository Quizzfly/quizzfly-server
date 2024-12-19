import { BaseResDto } from '@common/dto/base.res.dto';
import { Uuid } from '@common/types/common.type';
import {
  BooleanFieldOptional,
  ClassField,
  NumberFieldOptional,
  UUIDField,
  UUIDFieldOptional,
} from '@core/decorators/field.decorators';
import { QuestionResDto } from '@modules/room/dto/response/question.res.dto';
import { Expose } from 'class-transformer';

@Expose()
export class ParticipantResultResDto extends BaseResDto {
  @UUIDField({ name: 'participant_id' })
  @Expose()
  participantId: Uuid;

  @UUIDFieldOptional({ name: 'chosen_answer_id' })
  @Expose()
  chosenAnswerIid?: Uuid;

  @BooleanFieldOptional({ name: 'is_correct' })
  @Expose()
  isCorrect?: boolean;

  @NumberFieldOptional()
  @Expose()
  score?: number;

  @ClassField(() => QuestionResDto)
  @Expose()
  question: QuestionResDto;
}
