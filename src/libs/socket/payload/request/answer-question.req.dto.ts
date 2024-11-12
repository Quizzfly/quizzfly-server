import { StringField, UUIDField } from '@core/decorators/field.decorators';

export class AnswerQuestionReqDto {
  @StringField()
  roomPin: string;

  @UUIDField()
  questionId: string;

  @UUIDField()
  answerId: string;
}
