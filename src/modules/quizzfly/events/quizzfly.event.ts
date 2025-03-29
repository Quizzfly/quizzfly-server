import { Uuid } from '@common/types/common.type';
import { IEvent } from '@core/events/event.interface';

export enum QuizzflyAction {
  getQuestions = 'getQuestions',
}

export const QuizzflyScope = 'quizzfly';

interface GetQuestionsDto {
  quizzflyId: Uuid;
  userId: Uuid;
}

export class GetQuestionsEvent implements IEvent<GetQuestionsDto> {
  readonly scope = QuizzflyScope;
  readonly name = QuizzflyAction.getQuestions;

  constructor(readonly payload: GetQuestionsDto) {}
}
