import { ParticipantInRoomEntity } from '@modules/room/entities/participant-in-room.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ParticipantInRoomRepository extends Repository<ParticipantInRoomEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(ParticipantInRoomEntity, dataSource.createEntityManager());
  }

  async updateLeaderBoard(
    participants: ParticipantInRoomEntity[],
  ): Promise<void> {}
}
