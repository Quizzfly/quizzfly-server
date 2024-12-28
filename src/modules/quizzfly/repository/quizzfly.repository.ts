import { Uuid } from '@common/types/common.type';
import { QuizzflyEntity } from '@modules/quizzfly/entity/quizzfly.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class QuizzflyRepository extends Repository<QuizzflyEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(QuizzflyEntity, dataSource.createEntityManager());
  }

  async getQuestionsByQuizzflyId(quizzflyId: Uuid) {
    const quizzfly = await this.createQueryBuilder('quizzfly')
      .leftJoinAndSelect('quizzfly.slides', 'slides')
      .leftJoinAndSelect('quizzfly.quizzes', 'quizzes')
      .leftJoinAndSelect('quizzes.answers', 'answers')
      .where('quizzfly.id = :quizzflyId', { quizzflyId })
      .orderBy('answers.index', 'ASC')
      .orderBy('answers.createdAt', 'ASC')
      .getOne();

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
