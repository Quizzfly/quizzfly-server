import { Uuid } from '@common/types/common.type';
import { ROLE } from '@core/constants/entity.enum';
import { convertSnakeToCamel } from '@core/helpers';
import { AdminQueryUserReqDto } from '@modules/user/dto/request/admin-query-user.req.dto';
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
      .leftJoinAndSelect('user.userInfo', 'user_info')
      .where('user.id = :id', { id: userId })
      .getOne();
  }

  async getListUser(filterOptions: AdminQueryUserReqDto) {
    const skip = filterOptions.page
      ? (filterOptions.page - 1) * filterOptions.limit
      : 0;

    const query = this.createQueryBuilder('user')
      .select([
        'user.id as id',
        'user.email as email',
        'user.role as role',
        'user.createdAt as created_at',
        'user.updatedAt as updated_at',
        'user.deletedAt as deleted_at',
      ])
      .leftJoinAndSelect('user.userInfo', 'user_info')
      .where('user.role = :role', { role: ROLE.USER })
      .andWhere(
        filterOptions.isDeleted
          ? 'user.deletedAt IS NOT NULL'
          : 'user.deletedAt IS NULL',
      )
      .orderBy('user.createdAt', filterOptions.order)
      .offset(skip)
      .withDeleted()
      .limit(filterOptions.limit);

    return convertSnakeToCamel(await query.getRawMany());
  }
}
