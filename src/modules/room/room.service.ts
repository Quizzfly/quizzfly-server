import { CommonFunction } from '@common/common.function';
import { Uuid } from '@common/types/common.type';
import { ErrorCode } from '@core/constants/error-code/error-code.constant';
import { Optional } from '@core/utils/optional';
import { QuizzflyService } from '@modules/quizzfly/quizzfly.service';
import { CreateRoomReqDto } from '@modules/room/dto/request/create-room.req';
import { InfoRoomResDto } from '@modules/room/dto/response/info-room.res';
import { RoomStatus } from '@modules/room/entities/constants/room-status.enum';
import { RoomEntity } from '@modules/room/entities/room.entity';
import { RoomAction, RoomScope } from '@modules/room/events';
import { SettingRoomPayload } from '@modules/room/events/setting-room.event';
import { RoomRepository } from '@modules/room/repositories/room.repository';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class RoomService {
  constructor(
    private readonly roomRepository: RoomRepository,
    private readonly quizzflyService: QuizzflyService,
  ) {}

  @Transactional()
  async createRoom(userId: Uuid, dto: CreateRoomReqDto) {
    let roomPin: string;
    const quizzfly = await this.quizzflyService.findById(dto.quizzflyId);
    if (userId !== quizzfly.userId) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }

    do {
      roomPin = await CommonFunction.generateRoomPin();
    } while (await this.roomRepository.existRoomPin(roomPin));

    const room = new RoomEntity({
      roomPin: roomPin,
      roomStatus: RoomStatus.WAITING,
      isShowQuestion: dto.isShowQuestion,
      isAutoPlay: dto.isAutoPlay,
      lobbyMusic: dto.lobbyMusic,
      hostId: userId,
      quizzflyId: quizzfly.id,
    });

    await this.roomRepository.save(room);
    return room.toDto(InfoRoomResDto);
  }

  async findById(id: Uuid) {
    return Optional.of(await this.roomRepository.findById(id))
      .throwIfNotPresent(new NotFoundException(ErrorCode.ROOM_NOT_FOUND))
      .get();
  }

  @OnEvent(`${RoomScope}.${RoomAction.settingRoom}`)
  async settingRoom(payload: SettingRoomPayload) {
    const { userId, roomId, dto } = payload;
    const room = await this.findById(roomId);
    if (room.user.id !== userId) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }

    Object.assign(room, {
      isShowQuestion: dto.isShowQuestion,
      isAutoPlay: dto.isAutoPlay,
      lobbyMusic: dto.lobbyMusic,
    });

    await this.roomRepository.save(room);
    return room.toDto(InfoRoomResDto);
  }

  async getDetailRoomById(id: Uuid) {
    const room = await this.findById(id);
    return room.toDto(InfoRoomResDto);
  }
}
