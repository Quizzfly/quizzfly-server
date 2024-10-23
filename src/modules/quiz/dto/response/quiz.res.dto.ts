import { BaseResDto } from '@common/dto/base.res.dto';
import { FileDto } from '@common/dto/file.dto';
import { Uuid } from '@common/types/common.type';
import {
  ClassFieldOptional,
  EnumField,
  NumberField,
  StringField,
  UUIDField,
  UUIDFieldOptional,
} from '@core/decorators/field.decorators';
import { QuizType } from '@modules/quiz/enums/quiz-type.enum';

export class QuizResDto extends BaseResDto {
  @StringField()
  content: string;

  @NumberField({ name: 'time_limit' })
  timeLimit: number;

  @NumberField({ name: 'point_multiplier' })
  pointMultiplier: number;

  @EnumField(() => QuizType, {
    name: 'quiz_type',
    example: Object.values(QuizType).join(' | '),
  })
  quizType: QuizType;

  @ClassFieldOptional(() => FileDto, { each: true, isArray: true })
  files?: FileDto[];

  @UUIDFieldOptional({ name: 'prev_element_id', nullable: true })
  prevElementId: Uuid = null;

  @UUIDField({ name: 'quizzfly_id' })
  quizzflyId!: Uuid;
}
