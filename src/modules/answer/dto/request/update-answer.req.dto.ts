import { BooleanField } from '@core/decorators/field.decorators';
import { CreateAnswerReqDto } from '@modules/answer/dto/request/create-answer.req.dto';
import { PartialType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UpdateAnswerReqDto extends PartialType(CreateAnswerReqDto) {
  @BooleanField({ name: 'is_correct' })
  @Expose({ name: 'is_correct' })
  isCorrect: boolean;
}
