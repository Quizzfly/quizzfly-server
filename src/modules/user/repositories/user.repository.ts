import { OffsetPaginationDto } from '@common/dto/offset-pagination/offset-pagination.dto';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@common/types/common.type';
import { AdminQueryUserReqDto } from '@modules/user/dto/request/admin-query-user.req.dto';
import { UserResDto } from '@modules/user/dto/response/user.res.dto';
import { UserEntity } from '@modules/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Brackets, DataSource, Repository } from 'typeorm';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager());
  }

  async getListUser(filterOptions: AdminQueryUserReqDto) {
    const queryBuilder = this.createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.role',
        'user.createdAt',
        'user.updatedAt',
        'user.deletedAt',
      ])
      .leftJoinAndSelect('user.role', 'role')
      // .andWhere('role.name != :roleName', { roleName: ROLE.ADMIN })
      .withDeleted();

    if (filterOptions.role && filterOptions.role.length > 0) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          for (const [index, role] of filterOptions.role.entries()) {
            qb.orWhere(`role.name ILIKE :role${index}`, {
              [`role${index}`]: `%${role}%`,
            });
          }
        }),
      );
    }

    if (filterOptions.keywords) {
      queryBuilder.andWhere('user.email ILIKE :email', {
        email: `%${filterOptions.keywords}%`,
      });
    }
    if (filterOptions.onlyDeleted) {
      queryBuilder.andWhere('user.deletedAt IS NOT NULL');
    }
    queryBuilder
      .take(filterOptions.limit)
      .skip(
        filterOptions.page ? (filterOptions.page - 1) * filterOptions.limit : 0,
      )
      .orderBy('user.createdAt', filterOptions.order)
      .leftJoinAndSelect('user.userInfo', 'userInfo');

    const [users, totalRecords] = await queryBuilder.getManyAndCount();

    const meta = new OffsetPaginationDto(totalRecords, filterOptions);
    return new OffsetPaginatedDto(
      plainToInstance(UserResDto, users, { excludeExtraneousValues: true }),
      meta,
    );
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
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.userInfo', 'user_info')
      .where('user.id = :id', { id: userId })
      .getOne();
  }
}
