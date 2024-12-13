import { BaseResDto } from '@common/dto/base.res.dto';
import { Uuid } from '@common/types/common.type';
import {
  BooleanField,
  ClassFieldOptional,
  DateField,
  DateFieldOptional,
  EnumField,
  NumberField,
  NumberFieldOptional,
  StringFieldOptional,
  UUIDFieldOptional,
} from '@core/decorators/field.decorators';
import { AnswerResDto } from '@modules/answer/dto/response/answer.res.dto';
import { FileResDto } from '@modules/file/dto/file.res.dto';
import { QuizType } from '@modules/quiz/enums/quiz-type.enum';
import { QuizzflyContentType } from '@modules/quizzfly/enums/quizzfly-content-type.enum';
import { Expose, Transform } from 'class-transformer';

export class QuestionResDto extends BaseResDto {
  @Expose()
  roomId: Uuid;

  @EnumField(() => QuizzflyContentType, {
    example: Object.values(QuizzflyContentType).join('|'),
  })
  @Expose()
  type: QuizzflyContentType;

  @EnumField(() => QuizType, { name: 'quiz_type' })
  @Expose()
  quizType: QuizType;

  @DateField({ name: 'start_time' })
  @Expose()
  startTime: Date;

  @DateFieldOptional({ name: 'end_time' })
  @Expose()
  endTime?: Date;

  @BooleanField()
  @Expose()
  done: boolean;

  @UUIDFieldOptional({ name: 'correct_answer_id', default: null })
  @Expose()
  correctAnswerId?: Uuid;

  @StringFieldOptional({ default: null })
  @Expose()
  content?: string;

  @NumberFieldOptional({ name: 'time_limit', default: null })
  @Expose()
  timeLimit?: number;

  @NumberFieldOptional({ name: 'point_multiplier', default: null })
  @Expose()
  pointMultiplier: number;

  @ClassFieldOptional(() => FileResDto, { each: true, isArray: true })
  @Expose()
  files?: FileResDto[];

  @StringFieldOptional({ name: 'background_url', default: null })
  @Expose()
  backgroundUrl?: string;

  @NumberField({ name: 'question_index' })
  @Expose()
  questionIndex: number;

  @ClassFieldOptional(() => AnswerResDto, { isArray: true, each: true })
  @Transform(({ obj }) => Object.values(obj.answers))
  @Expose()
  answers?: AnswerResDto[];

  @NumberFieldOptional({ name: 'no_participant_answered', default: null })
  @Transform(({ obj }) => {
    return obj.choices
      ? Object.values(obj.choices).reduce(
          (acc: number, currentValue: number) => acc + currentValue,
          0,
        )
      : null;
  })
  @Expose()
  noParticipantAnswered?: number;
}
