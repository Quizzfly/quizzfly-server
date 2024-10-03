import { UserInfoEntity } from '@modules/user/entities/user-info.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UserInfoRepository extends Repository<UserInfoEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(UserInfoEntity, dataSource.createEntityManager());
  }
}
