import { Uuid } from '@common/types/common.type';
import { FilterRoomReqDto } from '@modules/room/dto/request/filter-room.req.dto';
import { RoomService } from '@modules/room/services/room.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportService {
  constructor(private readonly roomService: RoomService) {}

  async getListRoomForReport(hostId: Uuid, filter: FilterRoomReqDto) {
    return this.roomService.getAllRoom(hostId, filter);
  }
}
