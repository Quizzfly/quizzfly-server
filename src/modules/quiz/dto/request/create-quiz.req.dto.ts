import { EnumField } from '@core/decorators/field.decorators';
import { QuizType } from '@modules/quiz/enums/quiz-type.enum';
import { Expose } from 'class-transformer';

export class CreateQuizReqDto {
  @Expose({ name: 'quiz_type' })
  @EnumField(() => QuizType, {
    name: 'quiz_type',
    example: Object.values(QuizType).join(' | '),
  })
  quizType: QuizType;
}
