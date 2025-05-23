import { Uuid } from '@common/types/common.type';
import { ErrorCode } from '@core/constants/error-code/error-code.constant';
import { GroupEntity } from '@modules/group/entity/group.entity';
import { MemberInGroupEntity } from '@modules/group/entity/member-in-group.entity';
import { RoleInGroup } from '@modules/group/enums/role-in-group.enum';
import { MemberInGroupRepository } from '@modules/group/repository/member-in-group.repository';
import { ForbiddenException, Injectable } from '@nestjs/common';

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

  async isUserHasRoleHostInGroup(userId: Uuid, groupId: Uuid) {
    const memberInGroup =
      await this.memberInGroupRepository.findByMemberIdAndGroupId(
        userId,
        groupId,
      );
    return memberInGroup && memberInGroup.role === RoleInGroup.HOST;
  }

  async isUserInGroup(userId: Uuid, groupId: Uuid) {
    const memberInGroup =
      await this.memberInGroupRepository.findByMemberIdAndGroupId(
        userId,
        groupId,
      );
    if (!memberInGroup) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }
  }

  async getMemberInGroup(groupId: Uuid) {
    return await this.memberInGroupRepository.getMemberInGroup(groupId);
  }
}
