import { Uuid } from '@common/types/common.type';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { ApiAuth, ApiPublic } from '@core/decorators/http.decorators';
import { ValidateUuid } from '@core/decorators/validators/uuid-validator';
import { ICurrentUser } from '@modules/auth/types/jwt-payload.type';
import { CreateRoomReqDto } from '@modules/room/dto/request/create-room.req';
import { FilterRoomReqDto } from '@modules/room/dto/request/filter-room.req.dto';
import { GetParticipantReqDto } from '@modules/room/dto/request/get-participant.req.dto';
import { SettingRoomReqDto } from '@modules/room/dto/request/setting-room.req';
import { InfoRoomResDto } from '@modules/room/dto/response/info-room.res';
import { ParticipantResDto } from '@modules/room/dto/response/participant.res.dto';
import { QuestionResDto } from '@modules/room/dto/response/question.res.dto';
import { RoomReportResDto } from '@modules/room/dto/response/room-report.res.dto';
import { ParticipantInRoomService } from '@modules/room/services/participant-in-room.service';
import { QuestionService } from '@modules/room/services/question.service';
import { RoomService } from '@modules/room/services/room.service';
import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Room APIs')
@Controller({
  path: 'rooms',
  version: '1',
})
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly participantInRoomService: ParticipantInRoomService,
    private readonly questionService: QuestionService,
  ) {}

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
    @Param('roomId', ValidateUuid) roomId: Uuid,
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
  async getDetailRoom(@Param('roomId', ValidateUuid) roomId: Uuid) {
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
  getListParticipantInRoom(
    @Param('roomId', ValidateUuid) roomId: Uuid,
    @Query() filter: GetParticipantReqDto,
  ) {
    return this.participantInRoomService.getListParticipantInRoom(
      roomId,
      filter,
    );
  }

  @ApiAuth({
    summary: 'Get list question in room',
    isArray: true,
    type: QuestionResDto,
  })
  @ApiParam({
    name: 'roomId',
    description: 'The UUID of the room',
    type: 'string',
  })
  @Get(':roomId/questions')
  getListQuestionInRoom(@Param('roomId', ValidateUuid) roomId: Uuid) {
    return this.questionService.getListQuestionInRoom(roomId);
  }

  @ApiAuth({
    summary: 'Get list question and result in room',
    isArray: true,
  })
  @ApiParam({
    name: 'roomId',
    description: 'The UUID of the room',
    type: 'string',
  })
  @Get(':roomId/questions/results')
  getListQuestionAndResultInRoom(@Param('roomId', ValidateUuid) roomId: Uuid) {}

  @ApiAuth({
    summary: 'Get one question and result in room',
    isArray: true,
  })
  @ApiParam({
    name: 'roomId',
    description: 'The UUID of the room',
    type: 'string',
  })
  @ApiParam({
    name: 'questionId',
    description: 'The UUID of the question',
    type: 'string',
  })
  @Get(':roomId/questions/:questionId/results')
  getQuestionAndResultInRoom(
    @Param('roomId', ValidateUuid) roomId: Uuid,
    @Param('questionId', ValidateUuid) questionId: Uuid,
  ) {}
}
