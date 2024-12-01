import { Uuid } from '@common/types/common.type';
import { UUIDField } from '@core/decorators/field.decorators';
import { ParticipantDto } from '@modules/room/payload/participant.dto';
import { Expose } from 'class-transformer';

export class AnswerQuestionDto extends ParticipantDto {
  @UUIDField()
  @Expose({ name: 'question_id' })
  questionId: Uuid;

  @UUIDField()
  @Expose({ name: 'answer_id' })
  answerId: Uuid;
}
