import {
  EnumField,
  NumberField,
  StringField,
} from '@/core/decorators/field.decorators';
import { QuizType } from '@modules/quiz/enums/quiz-type.enum';
import { Expose } from 'class-transformer';

@Expose()
export class OptionDto {
  @StringField()
  @Expose()
  theme: string;

  @NumberField()
  @Expose()
  numberOfQuestion: number;

  @EnumField(() => QuizType, { each: true })
  @Expose()
  quizTypes: QuizType[];
}
