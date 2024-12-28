import { ResourceLimitEntity } from '@modules/subscription/entity/resource-limit.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ResourceLimitRepository extends Repository<ResourceLimitEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(ResourceLimitEntity, dataSource.createEntityManager());
  }
}
