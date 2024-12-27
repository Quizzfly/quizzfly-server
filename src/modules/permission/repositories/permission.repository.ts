import { PermissionEntity } from '@modules/permission/entities/permission.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class PermissionRepository extends Repository<PermissionEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(PermissionEntity, dataSource.createEntityManager());
  }

  async getPermissionGroupByResource() {
    const groupedPermissions = await this.createQueryBuilder('permission')
      .select([
        'permission.resource AS resource',
        '(SELECT json_agg(row_to_json(p)) FROM permission p WHERE p.resource = permission.resource) AS actions',
      ])
      .orderBy('permission.action', 'ASC')
      .groupBy('permission.resource')
      .orderBy('permission.resource', 'ASC')
      .getRawMany();

    return groupedPermissions;
  }
}
