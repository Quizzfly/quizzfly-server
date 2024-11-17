import { Uuid } from '@common/types/common.type';
import { IEvent } from '@core/events/event.interface';

export const QuizScope = 'quiz';

export enum QuizAction {
  getQuizEntity = 'get-quiz-entity',
  updatePosition = 'update-position',
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
