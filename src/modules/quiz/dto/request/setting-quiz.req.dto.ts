import { NumberFieldOptional } from '@core/decorators/field.decorators';
import { CreateQuizReqDto } from '@modules/quiz/dto/request/create-quiz.req.dto';
import { PartialType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SettingQuizReqDto extends PartialType(CreateQuizReqDto) {
  @Expose({ name: 'time_limit' })
  @NumberFieldOptional({ name: 'time_limit', default: 20 })
  timeLimit?: number = 20;

  @Expose({ name: 'point_multiplier' })
  @NumberFieldOptional({ name: 'point_multiplier', min: 0, default: 0 })
  pointMultiplier?: number = 0;
}
