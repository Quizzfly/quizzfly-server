import { BaseResDto } from '@common/dto/base.res.dto';
import {
  BooleanField,
  ClassFieldOptional,
  NumberField,
  StringField,
  UUIDField,
} from '@core/decorators/field.decorators';
import { FileResDto } from '@modules/file/dto/file.res.dto';

export class AnswerResDto extends BaseResDto {
  @StringField()
  content: string;

  @BooleanField({ name: 'is_correct' })
  isCorrect: boolean;

  @ClassFieldOptional(() => FileResDto, { each: true, isArray: true })
  files?: Array<FileResDto>;

  @NumberField()
  index: number;

  @UUIDField({ name: 'quiz_id' })
  quizId: string;
}
