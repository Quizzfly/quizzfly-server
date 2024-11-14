import { DataSource, Repository } from 'typeorm';
import { GroupEntity } from '@modules/group/entity/group.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GroupRepository extends Repository<GroupEntity> {

  constructor(private readonly dataSource: DataSource) {
    super(GroupEntity, dataSource.createEntityManager());
  }
}
