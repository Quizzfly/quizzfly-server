import { QuizEntity } from '@modules/quiz/entities/quiz.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class QuizRepository extends Repository<QuizEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(QuizEntity, dataSource.createEntityManager());
  }
}
