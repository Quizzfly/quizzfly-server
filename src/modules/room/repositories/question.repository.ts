import { QuestionEntity } from '@modules/room/entities/question.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class QuestionRepository extends Repository<QuestionEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(QuestionEntity, dataSource.createEntityManager());
  }
}
