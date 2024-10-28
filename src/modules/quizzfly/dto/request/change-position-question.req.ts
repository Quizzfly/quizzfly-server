import { Uuid } from '@common/types/common.type';
import { NumberField, StringField, UUIDField } from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

export class ChangePositionQuestionReqDto {
  @Expose({ name: 'first_question_id' })
  @UUIDField({ name: 'first_question_id' })
  firstQuestionId: Uuid;

  @Expose({ name: 'first_question_type' })
  @StringField({ name: 'first_question_type' })
  firstQuestionType: string;

  @Expose({ name: 'first_question_index' })
  @NumberField({ name: 'first_question_index' })
  firstQuestionIndex: number;

  @Expose({ name: 'second_question_id' })
  @UUIDField({ name: 'second_question_id' })
  secondQuestionId?: Uuid;

  @Expose({ name: 'second_question_type' })
  @StringField({ name: 'second_question_type' })
  secondQuestionType: string;

  @Expose({ name: 'second_question_index' })
  @NumberField({ name: 'second_question_index' })
  secondQuestionIndex: number;
}
