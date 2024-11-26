import { CommentPostEntity } from '@modules/group/entity/comment-post.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class CommentPostRepository extends Repository<CommentPostEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(CommentPostEntity, dataSource.createEntityManager());
  }
}
