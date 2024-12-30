import { ClassField, StringField } from '@core/decorators/field.decorators';
import { OptionDto } from '@modules/quiz/dto/request/option-generate-quiz-by-ai.req.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

@Expose()
export class GenerateQuizByAiReqDto {
  @StringField()
  @Expose()
  model: string;

  @StringField()
  @Expose()
  language: string;

  @ClassField(() => OptionDto)
  @Expose()
  option: OptionDto;

  @ApiPropertyOptional({
    isArray: true,
    nullable: true,
    minLength: 0,
    minimum: 0,
    default: [],
  })
  @IsOptional()
  @IsNotEmpty()
  @Expose()
  quizzes?: string[] = [];
}
