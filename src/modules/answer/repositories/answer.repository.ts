import { AnswerEntity } from '@modules/answer/entities/answer.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class AnswerRepository extends Repository<AnswerEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(AnswerEntity, dataSource.createEntityManager());
  }
}
