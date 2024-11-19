import { WrapperType } from '@common/types/types';
import { ClassField } from '@core/decorators/field.decorators';
import { CreateQuizGeneratedReqDto } from '@modules/quiz/dto/request/create-quiz-generated.req.dto';

export class CreateMultipleQuizGeneratedReqDto {
  @ClassField(() => CreateQuizGeneratedReqDto, { each: true, isArray: true })
  quizzes: WrapperType<CreateQuizGeneratedReqDto[]>;
}
