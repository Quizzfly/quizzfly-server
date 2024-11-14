import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { Uuid } from '@common/types/common.type';
import { MemberInGroupEntity } from '@modules/group/entity/member-in-group.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class MemberInGroupRepository extends Repository<MemberInGroupEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(MemberInGroupEntity, dataSource.createEntityManager());
  }

  async getMyGroup(userId: Uuid, filterOptions: PageOptionsDto) {
    const skip = filterOptions.page
      ? (filterOptions.page - 1) * filterOptions.limit
      : 0;

    const query = this.createQueryBuilder('memberInGroup')
      .leftJoinAndSelect('memberInGroup.group', 'group')
      .select([
        'group.id',
        'group.createdAt',
        'group.updatedAt',
        'group.name',
        'group.description',
        'group.background',
        'memberInGroup.role',
      ])
      .where('memberInGroup.memberId = :userId', { userId })
      .andWhere('memberInGroup.deletedAt IS NULL')
      .orderBy('memberInGroup.createdAt', filterOptions.order)
      .offset(skip)
      .limit(filterOptions.limit);

    return query.getMany();
  }
}
