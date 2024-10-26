import {
  ClassFieldOptional,
  StringFieldOptional,
} from '@core/decorators/field.decorators';
import { FileReqDto } from '@modules/file/dto/file.req.dto';

export class UpdateQuizReqDto {
  @StringFieldOptional()
  content: string;

  @ClassFieldOptional(() => FileReqDto, { each: true, isArray: true })
  files?: FileReqDto[];
}
