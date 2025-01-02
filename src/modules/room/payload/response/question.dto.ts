import { BaseResDto } from '@common/dto/base.res.dto';
import { Uuid } from '@common/types/common.type';
import {
  BooleanField,
  ClassFieldOptional,
  EnumField,
  NumberField,
  NumberFieldOptional,
  StringField,
  StringFieldOptional,
  UUIDField,
  UUIDFieldOptional,
} from '@core/decorators/field.decorators';
import { FileResDto } from '@modules/file/dto/file.res.dto';
import { QuizType } from '@modules/quiz/enums/quiz-type.enum';
import { AnswerInRoom } from '@modules/room/entities/question.entity';
import { Expose, Transform } from 'class-transformer';

@Expose()
export class QuestionDto extends BaseResDto {
  @UUIDField()
  @Expose()
  roomId: Uuid;

  @StringField()
  @Expose()
  type: string;

  @EnumField(() => QuizType)
  @Expose()
  quizType: QuizType;

  @NumberField({ default: null })
  @Transform(({ obj }) =>
    obj.startTime ? new Date(obj.startTime).getTime() : null,
  )
  @Expose()
  startTime: number;

  @NumberFieldOptional({ default: null })
  @Transform(({ obj }) =>
    obj.endTime ? new Date(obj.endTime).getTime() : null,
  )
  @Expose()
  endTime?: number;

  @NumberFieldOptional({ default: null })
  @Expose()
  noParticipantAnswered?: number;

  @BooleanField()
  @Expose()
  done: boolean;

  @UUIDFieldOptional({ default: null })
  @Expose()
  correctAnswerId?: Uuid;

  @StringFieldOptional({ default: null })
  @Expose()
  content?: string;

  @NumberFieldOptional({ default: null })
  @Expose()
  timeLimit?: number;

  @NumberFieldOptional({ default: null })
  @Expose()
  pointMultiplier: number;

  @ClassFieldOptional(() => FileResDto, { each: true, isArray: true })
  @Expose()
  files?: FileResDto[];

  @StringFieldOptional({ name: 'background_url', default: null })
  @Expose()
  backgroundUrl?: string;

  @NumberField()
  @Expose()
  questionIndex: number;

  @Expose()
  choices?: Record<Uuid, number>;

  @Transform(({ obj }) =>
    Object.values(obj.answers).sort((a: any, b: any) => a.index - b.index),
  )
  @Expose()
  answers?: Array<AnswerInRoom>;
}
