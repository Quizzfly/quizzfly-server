import { CommonFunction } from '@common/common.function';
import { OffsetPaginationDto } from '@common/dto/offset-pagination/offset-pagination.dto';
import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@common/types/common.type';
import { ErrorCode } from '@core/constants/error-code/error-code.constant';
import { Optional } from '@core/utils/optional';
import { QuizzflyService } from '@modules/quizzfly/quizzfly.service';
import { CreateRoomReqDto } from '@modules/room/dto/request/create-room.req';
import { FilterRoomReqDto } from '@modules/room/dto/request/filter-room.req.dto';
import { SettingRoomReqDto } from '@modules/room/dto/request/setting-room.req';
import { InfoRoomResDto } from '@modules/room/dto/response/info-room.res';
import { RoomReportResDto } from '@modules/room/dto/response/room-report.res.dto';
import { RoomSummaryResDto } from '@modules/room/dto/response/room-summary.res.dto';
import { RoomStatus } from '@modules/room/entities/constants/room-status.enum';
import { RoomEntity } from '@modules/room/entities/room.entity';
import { RoomRepository } from '@modules/room/repositories/room.repository';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Between, In } from 'typeorm';
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
    return <RoomEntity>Optional.of(await this.roomRepository.findById(id))
      .throwIfNotPresent(new NotFoundException(ErrorCode.ROOM_NOT_FOUND))
      .get();
  }

  async settingRoom(userId: Uuid, roomId: Uuid, dto: SettingRoomReqDto) {
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

  async updateRoom(roomId: Uuid, dto: Partial<RoomEntity>) {
    const room = await this.findById(roomId);
    Object.assign(room, dto);
    await this.roomRepository.save(room);

    return room.toDto(InfoRoomResDto);
  }

  async getDetailRoomById(id: Uuid) {
    const room = await this.findById(id);
    return room.toDto(InfoRoomResDto);
  }

  async getAllRoom(hostId: Uuid, filter: FilterRoomReqDto) {
    const rooms = (await this.roomRepository.getAllRoom(
      hostId,
      filter,
    )) as RoomReportResDto[];

    const startTime = new Date(filter.fromDate).setHours(0, 0, 0, 0);
    const endTime = new Date(filter.toDate).getTime();

    const totalRecords = await this.roomRepository.count({
      where: {
        hostId,
        createdAt: Between(new Date(startTime), new Date(endTime)),
        roomStatus: filter.roomStatus ? In([...filter.roomStatus]) : undefined,
      },
    });

    const meta = new OffsetPaginationDto(totalRecords, {
      limit: filter.limit,
      page: filter.page,
    } as PageOptionsDto);

    return new OffsetPaginatedDto<RoomReportResDto>(
      plainToInstance(RoomReportResDto, rooms, {
        excludeExtraneousValues: true,
      }),
      meta,
    );
  }

  async getRoomSummary(roomId: Uuid) {
    const room = await this.roomRepository.getRoomSummary(roomId);

    return plainToInstance(RoomSummaryResDto, room, {
      excludeExtraneousValues: true,
    });
  }
}
