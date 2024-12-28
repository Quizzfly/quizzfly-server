import { OffsetPaginationDto } from '@common/dto/offset-pagination/offset-pagination.dto';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@common/types/common.type';
import { AdminQueryQuizzflyReqDto } from '@modules/quizzfly/dto/request/admin-query-quizzfly.req.dto';
import { QuizzflyDetailResDto } from '@modules/quizzfly/dto/response/quizzfly-detail.res';
import { QuizzflyEntity } from '@modules/quizzfly/entity/quizzfly.entity';
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Brackets, DataSource, Repository } from 'typeorm';

@Injectable()
export class QuizzflyRepository extends Repository<QuizzflyEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(QuizzflyEntity, dataSource.createEntityManager());
  }

  async getListQuizzfly(filterOptions: AdminQueryQuizzflyReqDto) {
    const searchCriteria = ['title', 'description'];
    const queryBuilder = this.createQueryBuilder('quizzfly')
      .leftJoinAndSelect('quizzfly.user', 'user')
      .leftJoinAndSelect('user.userInfo', 'userInfo')
      .withDeleted()
      .take(filterOptions.limit)
      .skip(
        filterOptions.page ? (filterOptions.page - 1) * filterOptions.limit : 0,
      )
      .orderBy('quizzfly.createdAt', filterOptions.order);

    if (filterOptions.onlyDeleted) {
      queryBuilder.andWhere('quizzfly.deletedAt IS NOT NULL');
    }

    if (filterOptions.keywords) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          for (const key of searchCriteria) {
            qb.orWhere(`quizzfly.${key} ILIKE :keywords`, {
              keywords: `%${filterOptions.keywords}%`,
            });
          }
        }),
      );
    }

    queryBuilder.select([
      'quizzfly',
      'user.id',
      'userInfo.username',
      'userInfo.avatar',
    ]);

    const [items, totalRecords] = await queryBuilder.getManyAndCount();

    const meta = new OffsetPaginationDto(totalRecords, filterOptions);
    return new OffsetPaginatedDto(
      plainToInstance(QuizzflyDetailResDto, items, {
        excludeExtraneousValues: true,
      }),
      meta,
    );
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
