import { BaseResDto } from '@common/dto/base.res.dto';
import { FileDto } from '@common/dto/file.dto';
import {
  BooleanField,
  ClassFieldOptional,
  StringField,
  UUIDField,
} from '@core/decorators/field.decorators';

export class AnswerResDto extends BaseResDto {
  @StringField()
  content: string;

  @BooleanField({ name: 'is_correct' })
  isCorrect: boolean;

  @ClassFieldOptional(() => FileDto, { each: true, isArray: true })
  files?: Array<FileDto>;

  @UUIDField({ name: 'quiz_id' })
  quizId: string;
}
