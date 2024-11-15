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
      .innerJoinAndSelect('memberInGroup.group', 'group')
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

  async findByMemberIdAndGroupId(memberId: Uuid, groupId: Uuid) {
    return this.findOne({
      where: {
        memberId: memberId,
        groupId: groupId,
      },
    });
  }

  async getMemberInGroup(groupId: Uuid) {
    const query = this.createQueryBuilder('memberInGroup')
      .innerJoinAndSelect('memberInGroup.member', 'member')
      .innerJoinAndSelect('member.userInfo', 'userInfo')
      .select([
        'member.id AS id',
        'member.email AS email',
        'userInfo.username AS username',
        'userInfo.name AS name',
        'userInfo.avatar AS avatar',
        'memberInGroup.role AS role_in_group',
      ])
      .where('memberInGroup.groupId = :groupId', { groupId })
      .andWhere('memberInGroup.deletedAt IS NULL');

    return await query.getRawMany();
  }
}
