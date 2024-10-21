import { FileDto } from '@common/dto/file.dto';
import {
  ClassFieldOptional,
  StringFieldOptional,
} from '@core/decorators/field.decorators';

export class CreateAnswerReqDto {
  @StringFieldOptional()
  content: string;

  @ClassFieldOptional(() => FileDto, { each: true, isArray: true })
  files?: FileDto[];
}
