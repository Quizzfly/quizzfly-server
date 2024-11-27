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
      .leftJoinAndSelect('post.quizzfly', 'quizzfly')
      .select([
        'post.id as id',
        'post.createdAt as created_at',
        'post.updatedAt as updated_at',
        'post.type as type',
        'post.content as content',
        'post.files as files',
        'post.memberId as member_id',
        'post.quizzflyId as quizzfly_id',
        'quizzfly.title as title',
        'quizzfly.description as description',
        'quizzfly.coverImage as cover_image',
        'quizzfly.theme as theme',
        'quizzfly.isPublic as is_public',
        'quizzfly.quizzflyStatus as quizzfly_status',
      ])
      .addSelect(
        (subQuery) =>
          subQuery
            .select('CAST(COUNT(*) AS INTEGER)')
            .from('react_post', 'react')
            .where('react.postId = post.id')
            .andWhere('react.deletedAt IS NULL'),
        'reactCount',
      )
      .addSelect(
        (subQuery) =>
          subQuery
            .select('CAST(COUNT(*) AS INTEGER)')
            .from('comment_post', 'comment')
            .where('comment.postId = post.id')
            .andWhere('comment.deletedAt IS NULL'),
        'commentCount',
      )
      .where('post.groupId = :groupId', { groupId })
      .andWhere('post.deletedAt IS NULL')
      .orderBy('post.createdAt', filterOptions.order)
      .offset(skip)
      .limit(filterOptions.limit);

    return await query.getRawMany();
  }
}
