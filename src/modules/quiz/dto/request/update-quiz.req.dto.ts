import {
  ClassFieldOptional,
  StringFieldOptional,
} from '@core/decorators/field.decorators';
import { FileReqDto } from '@modules/file/dto/file.req.dto';
import { CreateQuizReqDto } from '@modules/quiz/dto/request/create-quiz.req.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateQuizReqDto extends PartialType(CreateQuizReqDto) {
  @StringFieldOptional()
  content?: string;

  @ClassFieldOptional(() => FileReqDto, { each: true, isArray: true })
  files?: FileReqDto[];
}
