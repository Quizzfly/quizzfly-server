import { Uuid } from '@common/types/common.type';
import { IEvent } from '@core/events/event.interface';
import { UpdateSlideReqDto } from '@modules/slide/dto/request/update-slide.req';

export const SlideScope = 'slide';

export enum SlideAction {
  getSlideEntity = 'get-slide-entity',
  updatePosition = 'update-position',
  setBackgroundForMany = 'set-background-for-many',
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

export interface UpdateManySlideDto {
  quizzflyId: Uuid;
  dto: UpdateSlideReqDto;
}

export class UpdateManySlideEvent implements IEvent<UpdateManySlideDto> {
  readonly scope = SlideScope;
  readonly name = SlideAction.setBackgroundForMany;

  constructor(readonly payload: UpdateManySlideDto) {}
}
