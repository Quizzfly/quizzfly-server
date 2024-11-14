import { GroupEntity } from '@modules/group/entity/group.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class GroupRepository extends Repository<GroupEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(GroupEntity, dataSource.createEntityManager());
  }
}
