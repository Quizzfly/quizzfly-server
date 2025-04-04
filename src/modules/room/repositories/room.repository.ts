import { Uuid } from '@common/types/common.type';
import { convertSnakeToCamel } from '@core/helpers';
import { FilterRoomReqDto } from '@modules/room/dto/request/filter-room.req.dto';
import { RoomStatus } from '@modules/room/entities/constants/room-status.enum';
import { RoomEntity } from '@modules/room/entities/room.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';

@Injectable()
export class RoomRepository extends Repository<RoomEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(RoomEntity, dataSource.createEntityManager());
  }

  async existRoomPin(roomPin: string): Promise<boolean> {
    return this.exists({
      where: {
        roomPin: roomPin,
        roomStatus: In([RoomStatus.IN_PROGRESS, RoomStatus.WAITING]),
      },
    });
  }

  async findById(id: Uuid) {
    return await this.findOne({
      where: { id: id },
      relations: ['quizzfly', 'user'],
    });
  }

  async getAllRoom(hostId: Uuid, filter: FilterRoomReqDto) {
    const skip = filter.page ? (filter.page - 1) * filter.limit : 0;
    const startTime = new Date(filter.fromDate).setHours(0, 0, 0, 0);
    const endTime = new Date(filter.toDate).getTime();

    const query = this.createQueryBuilder('room')
      .where('room.deletedAt IS NULL')
      .andWhere('room.hostId = :hostId', { hostId: hostId })
      .andWhere('room.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(startTime),
        endDate: new Date(endTime),
      })
      .leftJoinAndSelect('room.quizzfly', 'quizzfly')
      .select([
        'room.id as id',
        'room.createdAt as created_at',
        'room.updatedAt as updated_at',
        'room.deletedAt as deleted_at',
        'room.roomPin as room_pin',
        'room.startTime as start_time',
        'room.endTime as end_time',
        'room.roomStatus as room_status',
        'room.isShowQuestion as is_show_question',
        'room.isAutoPlay as is_auto_play',
        'room.lobbyMusic as lobby_music',
        'room.hostId as host_id',
        'quizzfly.id as quizzfly_id',
        'quizzfly.title as quizzfly_title',
      ])
      .addSelect(
        (subQuery) =>
          subQuery
            .select('CAST(COUNT(*) AS INTEGER)')
            .from('participant_in_room', 'participant')
            .where('participant.roomId = room.id')
            .andWhere('participant.deletedAt IS NULL'),
        'participant_count',
      )
      .addSelect(
        (subQuery) =>
          subQuery
            .select('CAST(COUNT(*) AS INTEGER)')
            .from('question', 'question')
            .where('question.roomId = room.id')
            .andWhere('question.deletedAt IS NULL'),
        'question_count',
      )
      .orderBy(filter.sortBy, filter.order)
      .offset(skip)
      .limit(filter.limit);

    if (filter.roomStatus && filter.roomStatus.length > 0) {
      query.andWhere('room.roomStatus IN (:...status)', {
        status: Array.isArray(filter.roomStatus)
          ? filter.roomStatus
          : [filter.roomStatus],
      });
    }

    return convertSnakeToCamel(await query.getRawMany());
  }

  async getRoomSummary(roomId: Uuid) {
    const room = await this.createQueryBuilder('room')
      .where('room.deletedAt IS NULL')
      .andWhere('room.id = :roomId', { roomId })
      .leftJoin('room.user', 'host')
      .leftJoin('host.userInfo', 'hostInfo')
      .leftJoinAndSelect('room.quizzfly', 'quizzfly')
      .select([
        'room.id as id',
        'room.createdAt as created_at',
        'room.updatedAt as updated_at',
        'room.deletedAt as deleted_at',
        'room.roomPin as room_pin',
        'room.startTime as start_time',
        'room.endTime as end_time',
        'room.roomStatus as room_status',
        'room.isShowQuestion as is_show_question',
        'room.isAutoPlay as is_auto_play',
        'room.lobbyMusic as lobby_music',
        'host.id as host_id',
        'host.email as host_email',
        'hostInfo.username as host_username',
        'hostInfo.avatar as host_avatar',
        'hostInfo.name as host_name',
        'quizzfly.id as quizzfly_id',
        'quizzfly.title as quizzfly_title',
      ])
      .addSelect(
        (subQuery) =>
          subQuery
            .select('CAST(COUNT(*) AS INTEGER)')
            .from('participant_in_room', 'participant')
            .where('participant.roomId = room.id')
            .andWhere('participant.deletedAt IS NULL'),
        'participant_count',
      )
      .addSelect(
        (subQuery) =>
          subQuery
            .select('CAST(COUNT(*) AS INTEGER)')
            .from('question', 'question')
            .where('question.roomId = room.id')
            .andWhere('question.deletedAt IS NULL'),
        'question_count',
      )
      .getRawOne();

    return convertSnakeToCamel(room);
  }
}
