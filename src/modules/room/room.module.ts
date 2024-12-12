import { QuizzflyModule } from '@modules/quizzfly/quizzfly.module';
import { ParticipantAnswerEntity } from '@modules/room/entities/participant-answer.entity';
import { ParticipantInRoomEntity } from '@modules/room/entities/participant-in-room.entity';
import { QuestionEntity } from '@modules/room/entities/question.entity';
import { RoomEntity } from '@modules/room/entities/room.entity';
import { ParticipantAnswerRepository } from '@modules/room/repositories/participant-answer.repository';
import { ParticipantInRoomRepository } from '@modules/room/repositories/participant-in-room.repository';
import { QuestionRepository } from '@modules/room/repositories/question.repository';
import { RoomRepository } from '@modules/room/repositories/room.repository';
import { RoomController } from '@modules/room/room.controller';
import { RoomGateway } from '@modules/room/room.gateway';
import { ParticipantAnswerService } from '@modules/room/services/participant-answer.service';
import { ParticipantInRoomService } from '@modules/room/services/participant-in-room.service';
import { QuestionService } from '@modules/room/services/question.service';
import { RoomService } from '@modules/room/services/room.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

const providers = [
  RoomRepository,
  RoomService,
  RoomGateway,
  ParticipantInRoomRepository,
  ParticipantInRoomService,
  QuestionRepository,
  QuestionService,
  ParticipantAnswerRepository,
  ParticipantAnswerService,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoomEntity,
      ParticipantInRoomEntity,
      QuestionEntity,
      ParticipantAnswerEntity,
    ]),
    QuizzflyModule,
  ],
  controllers: [RoomController],
  providers: [
    RoomRepository,
    RoomService,
    RoomGateway,
    ParticipantInRoomRepository,
    ParticipantInRoomService,
    QuestionRepository,
    QuestionService,
    ParticipantAnswerRepository,
    ParticipantAnswerService,
  ],
  exports: providers,
})
export class RoomModule {}
