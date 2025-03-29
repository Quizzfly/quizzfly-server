import { OffsetPaginationDto } from '@common/dto/offset-pagination/offset-pagination.dto';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@common/types/common.type';
import { ActionList, ResourceList } from '@core/constants/app.constant';
import { PermissionFilterDto } from '@modules/permission/dto/request/permission-filter.dto';
import { PermissionRepository } from '@modules/permission/repositories/permission.repository';
import { Injectable } from '@nestjs/common';
import { FindManyOptions, ILike, In } from 'typeorm';

@Injectable()
export class PermissionService {
  constructor(private readonly repository: PermissionRepository) {}

  async getAllPermission(filter: PermissionFilterDto) {
    const searchCriteria = ['resource', 'action', 'name', 'description'];
    const whereCondition = [];
    const findOptions: FindManyOptions = {};

    if (filter.resource && filter.resource.length > 0) {
      whereCondition.push({ resource: In(filter.resource) });
    }

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

    const [permissions, totalRecords] =
      await this.repository.findAndCount(findOptions);

    const meta = new OffsetPaginationDto(totalRecords, filter);
    return new OffsetPaginatedDto(permissions, meta);
  }

  async getPermissionGroupByResource() {
    const permissions = await this.repository.getPermissionGroupByResource();
    return permissions;
  }

  async whereInIds(permission_ids: Array<Uuid>) {
    return await this.repository.findBy({ id: In(permission_ids) });
  }

  getAllResource() {
    return Object.values(ResourceList).map((resource) => ({
      key: resource,
      name: resource,
    }));
  }

  getAllAction() {
    return Object.values(ActionList).map((action) => ({
      key: action,
      name: action,
    }));
  }
}
