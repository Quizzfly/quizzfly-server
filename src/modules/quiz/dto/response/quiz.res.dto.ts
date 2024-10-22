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
import { Expose } from 'class-transformer';

export class QuizResDto extends BaseResDto {
  @StringField()
  @Expose()
  content: string;

  @NumberField({ name: 'time_limit' })
  @Expose({ name: 'time_limit' })
  timeLimit: number;

  @NumberField({ name: 'point_multiplier' })
  @Expose({ name: 'point_multiplier' })
  pointMultiplier: number;

  @EnumField(() => QuizType, {
    name: 'quiz_type',
    example: Object.values(QuizType).join(' | '),
  })
  @Expose({ name: 'quiz_type' })
  quizType: QuizType;

  @ClassFieldOptional(() => FileDto, { each: true, isArray: true })
  @Expose()
  files?: FileDto[];

  @UUIDFieldOptional({ name: 'prev_element_id', nullable: true })
  @Expose({ name: 'prev_element_id' })
  prevElementId: Uuid = null;

  @UUIDField({ name: 'quizzfly_id' })
  @Expose({ name: 'quizzfly_id' })
  quizzflyId!: Uuid;
}
