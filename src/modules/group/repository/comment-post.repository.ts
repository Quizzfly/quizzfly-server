import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { Uuid } from '@common/types/common.type';
import { CommentPostEntity } from '@modules/group/entity/comment-post.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class CommentPostRepository extends Repository<CommentPostEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(CommentPostEntity, dataSource.createEntityManager());
  }

  async getCommentInPost(postId: Uuid, filterOptions: PageOptionsDto) {
    const skip = filterOptions.page
      ? (filterOptions.page - 1) * filterOptions.limit
      : 0;

    const query = this.createQueryBuilder('comment_post')
      .select([
        'comment_post.id as id',
        'comment_post.createdAt as created_at',
        'comment_post.updatedAt as updated_at',
        'comment_post.content as content',
        'comment_post.files as files',
        'comment_post.memberId as member_id',
        'comment_post.parentCommentId as parent_comment_id',
      ])
      .where('comment_post.postId = :postId', { postId })
      .andWhere('comment_post.deletedAt IS NULL')
      .orderBy('comment_post.createdAt', filterOptions.order)
      .offset(skip)
      .limit(filterOptions.limit);

    return await query.getRawMany();
  }
}
