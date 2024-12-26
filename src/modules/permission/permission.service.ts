import { OffsetPaginationDto } from '@common/dto/offset-pagination/offset-pagination.dto';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { ActionList, ResourceList } from '@core/constants/app.constant';
import { PermissionFilterDto } from '@modules/permission/dto/request/permission-filter.dto';
import { PermissionRepository } from '@modules/permission/repositories/permission.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PermissionService {
  constructor(private readonly repository: PermissionRepository) {}

  async getAllPermission(filter: PermissionFilterDto) {
    const [permissions, totalRecords] = await Promise.all([
      this.repository.find({
        where: filter.prepareCondition(),
        relations: { roles: true },
        take: filter.limit,
        skip: filter.offset(),
        order: {
          resource: filter.order,
        },
      }),
      this.repository.countBy(filter.prepareCondition()),
    ]);

    const meta = new OffsetPaginationDto(totalRecords, filter);
    return new OffsetPaginatedDto(permissions, meta);
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
