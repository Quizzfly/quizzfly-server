import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { Uuid } from '@common/types/common.type';
import { convertSnakeToCamel } from '@core/helpers';
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
      .leftJoinAndSelect('comment_post.member', 'member')
      .leftJoinAndSelect('member.userInfo', 'memberInfo')
      .select([
        'comment_post.id as id',
        'comment_post.createdAt as created_at',
        'comment_post.updatedAt as updated_at',
        'comment_post.content as content',
        'comment_post.files as files',
        'memberInfo.username as username',
        'memberInfo.avatar as avatar',
        'memberInfo.name as name',
        'member.id as member_id',
      ])
      .addSelect(
        (subQuery) =>
          subQuery
            .select('CAST(COUNT(*) AS INTEGER)')
            .from('comment_post', 'childComment')
            .where('childComment.parentCommentId = comment_post.id')
            .andWhere('childComment.deletedAt IS NULL'),
        'countReplies',
      )
      .addSelect(
        (subQuery) =>
          subQuery.select('json_agg(reply)').from((qb) => {
            return qb
              .select([
                'reply.id as id',
                'reply.createdAt as created_at',
                'reply.updatedAt as updated_at',
                'reply.content as content',
                'reply.files as files',
                'reply.parentCommentId as parent_comment_id',
                'replyMemberInfo.username as username',
                'replyMemberInfo.avatar as avatar',
                'replyMemberInfo.name as name',
                'replyMember.id as member_id',
              ])
              .from('comment_post', 'reply')
              .leftJoin('reply.member', 'replyMember')
              .leftJoin('replyMember.userInfo', 'replyMemberInfo')
              .where('reply.parentCommentId = comment_post.id')
              .andWhere('reply.deletedAt IS NULL')
              .orderBy('reply.createdAt', 'ASC')
              .limit(5);
          }, 'reply'),
        'replies',
      )
      .where('comment_post.postId = :postId', { postId })
      .andWhere('comment_post.deletedAt IS NULL')
      .andWhere('comment_post.parentCommentId IS NULL')
      .orderBy('comment_post.createdAt', filterOptions.order)
      .offset(skip)
      .limit(filterOptions.limit);

    return convertSnakeToCamel(await query.getRawMany());
  }

  async getReplyComment(parentCommentId: Uuid, filterOptions: PageOptionsDto) {
    const skip = filterOptions.page
      ? (filterOptions.page - 1) * filterOptions.limit
      : 0;

    const query = this.createQueryBuilder('comment_post')
      .leftJoinAndSelect('comment_post.member', 'member')
      .leftJoinAndSelect('member.userInfo', 'memberInfo')
      .select([
        'comment_post.id as id',
        'comment_post.createdAt as created_at',
        'comment_post.updatedAt as updated_at',
        'comment_post.content as content',
        'comment_post.files as files',
        'comment_post.parentCommentId as parent_comment_id',
        'memberInfo.username as username',
        'memberInfo.avatar as avatar',
        'memberInfo.name as name',
        'member.id as member_id',
      ])
      .where('comment_post.parentCommentId = :parentCommentId', {
        parentCommentId,
      })
      .andWhere('comment_post.deletedAt IS NULL')
      .orderBy('comment_post.createdAt', filterOptions.order)
      .offset(skip)
      .limit(filterOptions.limit);

    return convertSnakeToCamel(await query.getRawMany());
  }
}
