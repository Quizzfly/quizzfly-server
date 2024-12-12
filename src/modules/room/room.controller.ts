import { Uuid } from '@common/types/common.type';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { ApiAuth, ApiPublic } from '@core/decorators/http.decorators';
import { ICurrentUser } from '@modules/auth/types/jwt-payload.type';
import { CreateRoomReqDto } from '@modules/room/dto/request/create-room.req';
import { FilterRoomReqDto } from '@modules/room/dto/request/filter-room.req.dto';
import { SettingRoomReqDto } from '@modules/room/dto/request/setting-room.req';
import { InfoRoomResDto } from '@modules/room/dto/response/info-room.res';
import { ParticipantResDto } from '@modules/room/dto/response/participant.res.dto';
import { RoomReportResDto } from '@modules/room/dto/response/room-report.res.dto';
import { RoomService } from '@modules/room/services/room.service';
import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Room APIs')
@Controller({
  path: 'rooms',
  version: '1',
})
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @ApiAuth({
    summary: 'Create room',
    type: InfoRoomResDto,
  })
  @Post()
  async createRoom(
    @CurrentUser('id') userId: Uuid,
    @Body() dto: CreateRoomReqDto,
  ) {
    return this.roomService.createRoom(userId, dto);
  }

  @ApiAuth({
    summary: 'Setting room',
    type: InfoRoomResDto,
  })
  @ApiParam({
    name: 'roomId',
    description: 'The UUID of the room',
    type: 'string',
  })
  @Put(':roomId/settings')
  async settingRoom(
    @CurrentUser('id') userId: Uuid,
    @Param('roomId') roomId: Uuid,
    @Body() dto: SettingRoomReqDto,
  ) {
    return this.roomService.settingRoom(userId, roomId, dto);
  }

  @ApiPublic({
    summary: 'Get detail Room',
    type: InfoRoomResDto,
  })
  @ApiParam({
    name: 'roomId',
    description: 'The UUID of the room',
    type: 'string',
  })
  @Get(':roomId')
  async getDetailRoom(@Param('roomId') roomId: Uuid) {
    return this.roomService.getDetailRoomById(roomId);
  }

  @ApiAuth({
    summary: 'Get list room for reports',
    isPaginated: true,
    paginationType: 'offset',
    type: RoomReportResDto,
  })
  @Get()
  getListRoomForReport(
    @CurrentUser() user: ICurrentUser,
    @Query() filter: FilterRoomReqDto,
  ) {
    return this.roomService.getAllRoom(user.id, filter);
  }

  @ApiAuth({
    summary: 'Get list participant in room',
    isArray: true,
    type: ParticipantResDto,
  })
  @ApiParam({
    name: 'roomId',
    description: 'The UUID of the room',
    type: 'string',
  })
  @Get(':roomId/participants')
  getListParticipantInRoom(@Param('roomId') roomId: Uuid) {}
}
