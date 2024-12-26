import { OffsetPaginationDto } from '@common/dto/offset-pagination/offset-pagination.dto';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@common/types/common.type';
import { Optional } from '@core/utils/optional';
import { RoleFilterDto } from '@modules/role/dto/request/role-filter.dto';
import { RoleEntity } from '@modules/role/entities/role.entity';
import { RoleRepository } from '@modules/role/repositories/role.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { FindOptionsWhere } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(private readonly repository: RoleRepository) {}

  async findOneRole(filter: FindOptionsWhere<RoleEntity>) {
    return Optional.of(await this.repository.findOneBy(filter))
      .throwIfNullable(new NotFoundException(''))
      .get() as RoleEntity;
  }

  async findAllRole(filter: RoleFilterDto) {
    const [roles, totalRecords] = await Promise.all([
      this.repository.find({
        take: filter.limit,
        skip: filter.offset(),
      }),
      this.repository.countBy({}),
    ]);

    const meta = new OffsetPaginationDto(totalRecords, filter);
    return new OffsetPaginatedDto(roles, meta);
  }

  async removeRole(roleId: Uuid) {
    await this.findOneRole({ id: roleId });
    await this.repository.softDelete({ id: roleId });
  }
}
