import { SessionEntity } from '@modules/session/entities/session.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class SessionRepository extends Repository<SessionEntity> {
  constructor(private readonly datasource: DataSource) {
    super(SessionEntity, datasource.createEntityManager());
  }
}
