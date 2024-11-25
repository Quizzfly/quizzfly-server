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
        'post.id',
        'post.createdAt',
        'post.updatedAt',
        'post.type',
        'post.content',
        'post.files',
        'post.memberId',
        'post.quizzflyId',
      ])
      .where('post.groupId = :groupId', { groupId })
      .andWhere('post.deletedAt IS NULL')
      .orderBy('post.createdAt', filterOptions.order)
      .offset(skip)
      .limit(filterOptions.limit);

    return query.getMany();
  }
}
