import {
  ClassFieldOptional,
  EnumField,
} from '@core/decorators/field.decorators';
import { PrevElementDto } from '@modules/quiz/dto/prev-element.dto';
import { QuizType } from '@modules/quiz/enums/quiz-type.enum';
import { Expose } from 'class-transformer';

export class CreateQuizReqDto {
  @Expose({ name: 'quiz_type' })
  @EnumField(() => QuizType, {
    name: 'quiz_type',
    example: Object.values(QuizType).join(' | '),
  })
  quizType: QuizType;

  @ClassFieldOptional(() => PrevElementDto, {
    name: 'prev_element',
    nullable: true,
  })
  @Expose({ name: 'prev_element' })
  prevElement?: PrevElementDto = null;
}
