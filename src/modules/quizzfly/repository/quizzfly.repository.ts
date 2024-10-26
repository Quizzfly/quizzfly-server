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
    return await this.manager.query(
      `
        SELECT id               as id,
               content          AS content,
               'SLIDE'          AS type,
               created_at       as created_at,
               updated_at       as updated_at,
               to_jsonb(files)  as files,
               background_color as background_color,
               NULL             as time_limit,
               NULL             as point_multiplier,
               NULL             as quiz_type,
               prev_element_id  as prev_element_id
        FROM slide
        WHERE quizzfly_id = $1
          and deleted_at is null

        UNION ALL

        SELECT id               as id,
               content          AS content,
               'QUIZ'           AS type,
               created_at       as created_at,
               updated_at       as updated_at,
               files            as files,
               NULL             as background_color,
               time_limit       as time_limit,
               point_multiplier as point_multiplier,
               quiz_type        as quiz_type,
               prev_element_id  as prev_element_id
        FROM quiz
        WHERE quizzfly_id = $1
          and deleted_at is null
      `,
      [quizzflyId],
    );
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
