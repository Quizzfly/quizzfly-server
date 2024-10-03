import { Uuid } from '@common/types/common.type';
import { UserEntity } from '@modules/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager());
  }

  async getUserInfo(userId: Uuid) {
    return this.createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.role',
        'user.createdAt',
        'user.updatedAt',
        'user.deletedAt',
      ])
      .leftJoinAndSelect(
        'user.userInfo',
        'user_info',
        'user_info.user_id = :userId',
        { userId },
      )
      .getOne();
  }
}
