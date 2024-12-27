import { OffsetPaginationDto } from '@common/dto/offset-pagination/offset-pagination.dto';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@common/types/common.type';
import { Optional } from '@core/utils/optional';
import { PermissionService } from '@modules/permission/permission.service';
import { RoleFilterDto } from '@modules/role/dto/request/role-filter.dto';
import { RoleEntity } from '@modules/role/entities/role.entity';
import { RoleRepository } from '@modules/role/repositories/role.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { FindManyOptions, FindOptionsWhere, ILike } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(
    private readonly repository: RoleRepository,
    private readonly permissionsService: PermissionService,
  ) {}

  async findOneRole(filter: FindOptionsWhere<RoleEntity>) {
    return Optional.of(
      await this.repository.findOne({
        where: filter,
        relations: { permissions: true },
      }),
    )
      .throwIfNullable(new NotFoundException(''))
      .get() as RoleEntity;
  }

  async findAllRole(filter: RoleFilterDto) {
    const searchCriteria = ['name', 'description'];
    const whereCondition = [];
    const findOptions: FindManyOptions = {};

    if (filter.keywords) {
      for (const key of searchCriteria) {
        whereCondition.push({
          [key]: ILike(`%${filter.keywords}%`),
        });
      }
    }
    findOptions.take = filter.limit;
    findOptions.skip = filter.page ? (filter.page - 1) * filter.limit : 0;
    findOptions.where = whereCondition;
    findOptions.order = { createdAt: filter.order };

    const [roles, totalRecords] =
      await this.repository.findAndCount(findOptions);

    const meta = new OffsetPaginationDto(totalRecords, filter);
    return new OffsetPaginatedDto(roles, meta);
  }

  async removeRole(roleId: Uuid) {
    await this.findOneRole({ id: roleId });
    await this.repository.softDelete({ id: roleId });
  }
}
