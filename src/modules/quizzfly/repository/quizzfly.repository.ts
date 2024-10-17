import { Uuid } from '@common/types/common.type';
import { QuizzflyEntity } from '@modules/quizzfly/entity/quizzfly.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class QuizzflyRepository extends Repository<QuizzflyEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(QuizzflyEntity, dataSource.createEntityManager());
  }

  async getMyQuizzfly(userId: Uuid) {
    return this.find({
      where: { userId: userId },
    });
  }

  async getQuestionsByQuizzflyId(quizzflyId: Uuid) {
    return this.createQueryBuilder('quizzfly')
      .innerJoinAndSelect('quizzfly.slides', 'slides')
      .select('slides')
      .where('quizzfly.id = :quizzflyId', { quizzflyId })
      .getRawMany();
  }
}
