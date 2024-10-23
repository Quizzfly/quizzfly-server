import { Uuid } from '@common/types/common.type';
import { QuizEntity } from '@modules/quiz/entities/quiz.entity';
import { QuizzflyEntity } from '@modules/quizzfly/entity/quizzfly.entity';
import { SlideEntity } from '@modules/slide/entity/slide.entity';
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
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getQuestionsByQuizzflyId(quizzflyId: Uuid) {
    return this.createQueryBuilder('quizzfly')
      .innerJoinAndSelect('quizzfly.slides', 'slides')
      .select('slides')
      .where('quizzfly.id = :quizzflyId', { quizzflyId })
      .getRawMany();
  }

  async getLastItem(
    quizzflyId: Uuid,
  ): Promise<SlideEntity | QuizEntity | null> {
    const lastItem: any = await this.find({
      where: { id: quizzflyId },
      relations: ['quizzes', 'quizzes.answers', 'slides'],
    });
    if (!lastItem) {
      return null;
    }
    return lastItem[0];
  }

  async getNextItem(quizzflyId: Uuid) {}

  async getPreviousItem(quizzflyId: Uuid) {}
}
