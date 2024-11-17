import { Uuid } from '@common/types/common.type';
import { IEvent } from '@core/events/event.interface';

export const SlideScope = 'slide';

export enum SlideAction {
  getSlideEntity = 'get-slide-entity',
  updatePosition = 'update-position',
}

export interface UpdatePositionSlidePayLoad {
  slideId: Uuid;
  prevElementId: Uuid;
}

export class GetSlideEntityEvent implements IEvent<Uuid> {
  readonly scope = SlideScope;
  readonly name = SlideAction.getSlideEntity;

  constructor(readonly payload: Uuid) {}
}

export class UpdatePositionSlideEvent
  implements IEvent<UpdatePositionSlidePayLoad>
{
  readonly scope = SlideScope;
  readonly name = SlideAction.updatePosition;

  constructor(readonly payload: UpdatePositionSlidePayLoad) {}
}
