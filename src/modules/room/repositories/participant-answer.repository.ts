import { ParticipantAnswerEntity } from '@modules/room/entities/participant-answer.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ParticipantAnswerRepository extends Repository<ParticipantAnswerEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(ParticipantAnswerEntity, dataSource.createEntityManager());
  }
}
