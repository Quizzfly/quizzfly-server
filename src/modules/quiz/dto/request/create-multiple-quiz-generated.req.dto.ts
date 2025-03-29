import { ClassField } from '@core/decorators/field.decorators';
import { CreateQuizGeneratedReqDto } from '@modules/quiz/dto/request/create-quiz-generated.req.dto';
import { ArrayMinSize } from 'class-validator';

export class CreateMultipleQuizGeneratedReqDto {
  @ClassField(() => CreateQuizGeneratedReqDto, {
    each: true,
    isArray: true,
  })
  @ArrayMinSize(1)
  quizzes: CreateQuizGeneratedReqDto[];
}
