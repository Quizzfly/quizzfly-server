import {
  ClassField,
  ClassFieldOptional,
  NumberField,
  StringField,
} from '@core/decorators/field.decorators';
import { QuestionDto } from '@modules/room/payload/response/question.dto';
import { Expose, Transform } from 'class-transformer';

@Expose()
export class QuizStartedDto {
  @StringField()
  @Expose()
  roomPin: string;

  @NumberField()
  @Transform(({ obj }) =>
    obj.startTime ? new Date(obj.startTime).getTime() : null,
  )
  @Expose()
  startTime: number;

  @ClassField(() => QuestionDto)
  @Expose()
  question: QuestionDto;

  @ClassFieldOptional(() => QuestionDto, { isArray: true, each: true })
  @Expose()
  questions?: Array<QuestionDto>;
}
