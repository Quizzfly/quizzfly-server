import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { convertCamelToSnake } from '@core/helpers';
import { GroupEntity } from '@modules/group/entity/group.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class GroupRepository extends Repository<GroupEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(GroupEntity, dataSource.createEntityManager());
  }

  async getListGroupByAdmin(filterOptions: PageOptionsDto) {
    const skip = filterOptions.page
      ? (filterOptions.page - 1) * filterOptions.limit
      : 0;

    const query = this.createQueryBuilder('group')
      .select([
        'group.id as id',
        'group.createdAt as created_at',
        'group.updatedAt as updated_at',
        'group.name as name',
        'group.description as description',
        'group.background as background',
      ])
      .orderBy('group.createdAt', filterOptions.order)
      .offset(skip)
      .limit(filterOptions.limit);

    return convertCamelToSnake(await query.getRawMany());
  }
}
