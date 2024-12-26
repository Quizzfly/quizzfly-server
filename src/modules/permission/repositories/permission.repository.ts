import { PermissionEntity } from '@modules/permission/entities/permission.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class PermissionRepository extends Repository<PermissionEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(PermissionEntity, dataSource.createEntityManager());
  }
}
