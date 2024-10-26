import { BaseResDto } from '@common/dto/base.res.dto';
import { Uuid } from '@common/types/common.type';
import {
  ClassFieldOptional,
  EnumField,
  NumberField,
  StringField,
  UUIDField,
  UUIDFieldOptional,
} from '@core/decorators/field.decorators';
import { FileResDto } from '@modules/file/dto/file.res.dto';
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

  @ClassFieldOptional(() => FileResDto, { each: true, isArray: true })
  files?: FileResDto[];

  @UUIDFieldOptional({ name: 'prev_element_id', nullable: true })
  prevElementId: Uuid = null;

  @UUIDField({ name: 'quizzfly_id' })
  quizzflyId!: Uuid;
}
