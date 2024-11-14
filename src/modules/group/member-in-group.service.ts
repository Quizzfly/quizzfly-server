import { Uuid } from '@common/types/common.type';
import { GroupEntity } from '@modules/group/entity/group.entity';
import { MemberInGroupEntity } from '@modules/group/entity/member-in-group.entity';
import { RoleInGroup } from '@modules/group/enums/role-in-group.enum';
import { MemberInGroupRepository } from '@modules/group/repository/member-in-group.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MemberInGroupService {
  constructor(
    private readonly memberInGroupRepository: MemberInGroupRepository,
  ) {}

  async addMemberToGroup(
    userId: Uuid,
    roleInGroup: RoleInGroup,
    group: GroupEntity,
  ) {
    const memberInGroup = new MemberInGroupEntity({
      memberId: userId,
      groupId: group.id,
      role: roleInGroup,
    });
    await this.memberInGroupRepository.save(memberInGroup);
  }
}
