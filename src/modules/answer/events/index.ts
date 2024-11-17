import { Uuid } from '@common/types/common.type';
import { IEvent } from '@core/events/event.interface';

export const AnswerScope = 'answer';

export const enum AnswerAction {
  duplicateAnswers = 'duplicateAnswers',
}

export interface DuplicateAnswersPayload {
  quizId: Uuid;
  duplicateQuizId: Uuid;
}

export class DuplicateAnswersEvent implements IEvent<DuplicateAnswersPayload> {
  readonly scope = AnswerScope;
  readonly name = AnswerAction.duplicateAnswers;

  constructor(readonly payload: DuplicateAnswersPayload) {}
}
