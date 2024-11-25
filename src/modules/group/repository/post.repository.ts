import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { Uuid } from '@common/types/common.type';
import { PostEntity } from '@modules/group/entity/post.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class PostRepository extends Repository<PostEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(PostEntity, dataSource.createEntityManager());
  }

  async getListPost(groupId: Uuid, filterOptions: PageOptionsDto) {
    const skip = filterOptions.page
      ? (filterOptions.page - 1) * filterOptions.limit
      : 0;

    const query = this.createQueryBuilder('post')
      .select([
        'post.id as id',
        'post.createdAt as created_at',
        'post.updatedAt as updated_at',
        'post.type as type',
        'post.content as content',
        'post.files as files',
        'post.memberId as member_id',
        'post.quizzflyId as quizzfly_id',
      ])
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(*)')
            .from('react_post', 'react')
            .where('react.postId = post.id')
            .andWhere('react.deletedAt IS NULL'),
        'reactCount',
      )
      .where('post.groupId = :groupId', { groupId })
      .andWhere('post.deletedAt IS NULL')
      .orderBy('post.createdAt', filterOptions.order)
      .offset(skip)
      .limit(filterOptions.limit);

    const rawResults = await query.getRawMany();

    const results = rawResults.map((row) => ({
      ...row,
      reactCount: Number(row.reactCount),
    }));

    return results;
  }
}
