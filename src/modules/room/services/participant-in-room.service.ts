import { Uuid } from '@common/types/common.type';
import { ErrorCode } from '@core/constants/error-code/error-code.constant';
import { Optional } from '@core/utils/optional';
import { GetParticipantReqDto } from '@modules/room/dto/request/get-participant.req.dto';
import { JoinRoomReqDto } from '@modules/room/dto/request/join-room.req.dto';
import { ParticipantResDto } from '@modules/room/dto/response/participant.res.dto';
import { ParticipantInRoomEntity } from '@modules/room/entities/participant-in-room.entity';
import { ParticipantInRoomRepository } from '@modules/room/repositories/participant-in-room.repository';
import { RoomService } from '@modules/room/services/room.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ParticipantInRoomService {
  constructor(
    private readonly repository: ParticipantInRoomRepository,
    private readonly roomService: RoomService,
  ) {}

  async findParticipant(participantId: Uuid) {
    return <ParticipantInRoomEntity>Optional.of(
      await this.repository.findOneBy({ id: participantId }),
    )
      .throwIfNullable(new NotFoundException('Participant not found'))
      .get();
  }

  async joinRoom(dto: JoinRoomReqDto) {
    await this.roomService.findById(dto.roomId);

    const participant = new ParticipantInRoomEntity(dto);
    return this.repository.save(participant);
  }

  async leaveRoom(roomId: Uuid, participantId: Uuid) {
    await this.roomService.findById(roomId);

    const participant = await this.findParticipant(participantId);
    participant.timeLeft = new Date();

    return this.repository.save(participant);
  }

  async kickParticipant(hostId: Uuid, roomId: Uuid, participantId: Uuid) {
    const room = await this.roomService.findById(roomId);
    if (hostId !== room.hostId) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }

    const participant = await this.findParticipant(participantId);
    participant.timeKicked = new Date();

    return this.repository.save(participant);
  }

  async updateMultipleParticipant(
    participants: Partial<ParticipantInRoomEntity>[],
  ) {
    return this.repository.save(participants);
  }

  async getListParticipantInRoom(roomId: Uuid, filter: GetParticipantReqDto) {
    await this.roomService.findById(roomId);

    const participants = await this.repository.find({
      where: { roomId: roomId },
      order: {
        [filter.sortBy as keyof ParticipantInRoomEntity]: filter.order,
      },
    });

    return plainToInstance(ParticipantResDto, participants);
  }
}
