import { Uuid } from '@common/types/common.type';
import { RoomStatus } from '@modules/room/entity/enums/room-status.enum';
import { RoomEntity } from '@modules/room/entity/room.entity';
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
}
