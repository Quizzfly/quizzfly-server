import { StringField, UUIDField } from '@core/decorators/field.decorators';

export class FinishQuestionReqDto {
  @StringField()
  roomPin: string;

  @UUIDField()
  questionId: string;
}
