import {
  BooleanFieldOptional,
  ClassFieldOptional,
  StringFieldOptional,
} from '@core/decorators/field.decorators';
import { FileReqDto } from '@modules/file/dto/file.req.dto';
import { Expose } from 'class-transformer';

export class CreateAnswerReqDto {
  @StringFieldOptional()
  content: string;

  @ClassFieldOptional(() => FileReqDto, { each: true, isArray: true })
  files?: FileReqDto[];

  @BooleanFieldOptional({ name: 'is_correct' })
  @Expose({ name: 'is_correct' })
  isCorrect?: boolean;
}
