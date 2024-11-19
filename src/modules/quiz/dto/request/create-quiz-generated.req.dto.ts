import { WrapperType } from '@common/types/types';
import {
  ClassFieldOptional,
  EnumField,
  NumberFieldOptional,
  StringFieldOptional,
} from '@core/decorators/field.decorators';
import { CreateAnswerReqDto } from '@modules/answer/dto/request/create-answer.req.dto';
import { QuizType } from '@modules/quiz/enums/quiz-type.enum';
import { OmitType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CreateQuizGeneratedReqDto {
  @Expose({ name: 'quiz_type' })
  @EnumField(() => QuizType, {
    name: 'quiz_type',
    example: Object.values(QuizType).join(' | '),
  })
  quizType: QuizType;

  @StringFieldOptional({ name: 'background_url' })
  @Expose({ name: 'background_url' })
  backgroundUrl?: string;

  @StringFieldOptional()
  content: string;

  @Expose({ name: 'time_limit' })
  @NumberFieldOptional({ name: 'time_limit', default: 20 })
  timeLimit?: number = 20;

  @Expose({ name: 'point_multiplier' })
  @NumberFieldOptional({ name: 'point_multiplier', min: 0, default: 0 })
  pointMultiplier?: number = 0;

  @ClassFieldOptional(() => OmitType(CreateAnswerReqDto, ['files']), {
    each: true,
    isArray: true,
  })
  answers?: WrapperType<Omit<CreateAnswerReqDto, 'files'>>[];
}
