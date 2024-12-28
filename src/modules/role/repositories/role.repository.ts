import { RoleEntity } from '@modules/role/entities/role.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class RoleRepository extends Repository<RoleEntity> {
  constructor(private readonly datasource: DataSource) {
    super(RoleEntity, datasource.createEntityManager());
  }
}
