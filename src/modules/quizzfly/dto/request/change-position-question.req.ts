import { Uuid } from '@common/types/common.type';
import { StringField, UUIDField } from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

export class ChangePositionQuestionReqDto {
  @Expose({ name: 'first_question_id' })
  @UUIDField({ name: 'first_question_id' })
  firstQuestionId: Uuid;

  @Expose({ name: 'first_question_type' })
  @StringField({ name: 'first_question_type' })
  firstQuestionType: string;

  @Expose({ name: 'second_question_id' })
  @UUIDField({ name: 'second_question_id' })
  secondQuestionId?: Uuid;

  @Expose({ name: 'second_question_type' })
  @StringField({ name: 'second_question_type' })
  secondQuestionType: string;
}
