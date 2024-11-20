import { Uuid } from '@common/types/common.type';
import { IEvent } from '@core/events/event.interface';
import { UpdateQuizReqDto } from '@modules/quiz/dto/request/update-quiz.req.dto';

export const QuizScope = 'quiz';

export enum QuizAction {
  getQuizEntity = 'get-quiz-entity',
  updatePosition = 'update-position',
  setBackgroundForManyQuiz = 'set-background-for-many',
}

export interface UpdatePositionQuizPayload {
  quizId: Uuid;
  prevElementId: Uuid;
}

export class GetQuizEntityEvent implements IEvent<Uuid> {
  readonly scope = QuizScope;
  readonly name = QuizAction.getQuizEntity;

  constructor(readonly payload: Uuid) {}
}

export class UpdatePositionQuizEvent
  implements IEvent<UpdatePositionQuizPayload>
{
  readonly scope = QuizScope;
  readonly name = QuizAction.updatePosition;

  constructor(readonly payload: UpdatePositionQuizPayload) {}
}

export interface UpdateManyQuizDto {
  quizzflyId: Uuid;
  dto: UpdateQuizReqDto;
}

export class UpdateManyQuizEvent implements IEvent<UpdateManyQuizDto> {
  readonly scope = QuizScope;
  readonly name = QuizAction.setBackgroundForManyQuiz;

  constructor(readonly payload: UpdateManyQuizDto) {}
}
