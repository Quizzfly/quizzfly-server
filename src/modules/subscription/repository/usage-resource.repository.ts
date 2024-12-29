import { UsageResourceEntity } from '@modules/subscription/entity/usage-resource.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UsageResourceRepository extends Repository<UsageResourceEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(UsageResourceEntity, dataSource.createEntityManager());
  }
}
