import { Uuid } from '@common/types/common.type';
import { IEvent } from '@core/events/event.interface';
import { SettingRoomReqDto } from '@modules/room/dto/request/setting-room.req';
import { RoomAction, RoomScope } from '@modules/room/events/index';

export interface SettingRoomPayload {
  userId: Uuid;
  roomId: Uuid;
  dto: SettingRoomReqDto;
}

export class SettingRoomEvent implements IEvent<SettingRoomPayload> {
  readonly scope = RoomScope;
  readonly name = RoomAction.settingRoom;

  constructor(readonly payload: SettingRoomPayload) {}
}
