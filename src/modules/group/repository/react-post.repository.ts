import { ReactPostEntity } from '@modules/group/entity/react-post.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ReactPostRepository extends Repository<ReactPostEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(ReactPostEntity, dataSource.createEntityManager());
  }
}
