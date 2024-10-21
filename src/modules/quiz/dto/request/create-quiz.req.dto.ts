import { FileDto } from '@common/dto/file.dto';
import {
  ClassFieldOptional,
  EnumField,
  NumberFieldOptional,
  StringFieldOptional,
} from '@core/decorators/field.decorators';
import { QuizType } from '@modules/quiz/enums/quiz-type.enum';
import { Expose } from 'class-transformer';

export class CreateQuizReqDto {
  @StringFieldOptional()
  content: string;

  @Expose({ name: 'time_limit' })
  @NumberFieldOptional({ name: 'time_limit', default: 20 })
  timeLimit?: number;

  @Expose({ name: 'point_multiplier' })
  @NumberFieldOptional({ name: 'point_multiplier', min: 0, default: 0 })
  pointMultiplier?: number = 0;

  @Expose({ name: 'quiz_type' })
  @EnumField(() => QuizType, {
    name: 'quiz_type',
    example: Object.values(QuizType).join(' | '),
  })
  quizType: QuizType;

  @ClassFieldOptional(() => FileDto, { each: true, isArray: true })
  files?: FileDto[];
}
