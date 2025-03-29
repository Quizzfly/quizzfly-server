import { Uuid } from '@common/types/common.type';
import { IEvent } from '@core/events/event.interface';
import { AnswerEntity } from '@modules/answer/entities/answer.entity';

export const AnswerScope = 'answer';

export const enum AnswerAction {
  duplicateAnswers = 'duplicateAnswers',
  insertMany = 'insertMany',
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

export class InsertManyAnswerEvent implements IEvent<Array<AnswerEntity>> {
  readonly scope = AnswerScope;
  readonly name = AnswerAction.insertMany;

  constructor(readonly payload: Array<AnswerEntity>) {}
}
