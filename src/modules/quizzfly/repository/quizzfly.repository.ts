import { Uuid } from '@common/types/common.type';
import { QueryQuizzflyReqDto } from '@modules/quizzfly/dto/request/query-quizzfly.req.dto';
import { QuizzflyEntity } from '@modules/quizzfly/entity/quizzfly.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class QuizzflyRepository extends Repository<QuizzflyEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(QuizzflyEntity, dataSource.createEntityManager());
  }

  async getMyQuizzfly(userId: Uuid, filterOptions: QueryQuizzflyReqDto) {
    const skip = filterOptions.page
      ? (filterOptions.page - 1) * filterOptions.limit
      : 0;
    return this.find({
      where: { userId: userId },
      skip,
      take: filterOptions.limit,
      order: {
        createdAt: filterOptions.order,
      },
    });
  }

  async getQuestionsByQuizzflyId(quizzflyId: Uuid) {
    const quizzfly = await this.findOne({
      where: { id: quizzflyId },
      relations: ['slides', 'quizzes', 'quizzes.answers'],
    });

    const slides = quizzfly.slides.map((slide) => {
      return Object.assign({}, slide, { type: 'SLIDE' });
    });

    const quizzes = quizzfly.quizzes.map((quiz) => {
      return Object.assign({}, quiz, { type: 'QUIZ' });
    });

    return [...slides, ...quizzes];
  }

  async getBehindQuestion(quizzflyId: Uuid, currentItemId: Uuid) {
    const result = await this.manager.query(
      `
        SELECT id, 'SLIDE' as type
        FROM slide
        WHERE quizzfly_id = $1
          and deleted_at is null
          and prev_element_id = $2

        UNION ALL

        SELECT id, 'QUIZ' as type
        FROM quiz
        WHERE quizzfly_id = $1
          and deleted_at is null
          and prev_element_id = $2
      `,
      [quizzflyId, currentItemId],
    );

    if (Array.isArray(result) && result.length > 0) {
      const { id, type } = result[0];
      return { id, type };
    }

    return null;
  }
}
