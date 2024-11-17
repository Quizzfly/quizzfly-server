import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { Uuid } from '@common/types/common.type';
import { CreateGroupReqDto } from '@modules/group/dto/request/create-group.req.dto';
import { GroupRepository } from '@modules/group/repository/group.repository';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { OffsetPaginationDto } from '@common/dto/offset-pagination/offset-pagination.dto';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { ErrorCode } from '@core/constants/error-code.constant';
import { Optional } from '@core/utils/optional';
import { MailService } from '@mail/mail.service';
import { InviteMemberToGroupReqDto } from '@modules/group/dto/request/invite-member-to-group.req.dto';
import { InfoDetailGroupResDto } from '@modules/group/dto/response/info-detail-group.res.dto';
import { InfoGroupResDto } from '@modules/group/dto/response/info-group.res.dto';
import { GroupEntity } from '@modules/group/entity/group.entity';
import { RoleInGroup } from '@modules/group/enums/role-in-group.enum';
import { MemberInGroupRepository } from '@modules/group/repository/member-in-group.repository';
import { MemberInGroupService } from '@modules/group/service/member-in-group.service';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class GroupService {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly memberInGroupRepository: MemberInGroupRepository,
    private readonly memberInGroupService: MemberInGroupService,
    private readonly mailService: MailService,
  ) {}

  @Transactional()
  async createGroup(userId: Uuid, dto: CreateGroupReqDto) {
    const group = new GroupEntity({
      ...dto,
    });
    await this.groupRepository.save(group);
    await this.memberInGroupService.addMemberToGroup(
      userId,
      RoleInGroup.HOST,
      group,
    );
    return group.toDto(InfoGroupResDto);
  }

  async getMyGroup(userId: Uuid, filterOptions: PageOptionsDto) {
    const groups = await this.memberInGroupRepository.getMyGroup(
      userId,
      filterOptions,
    );
    const responseData = groups.map((group) =>
      group.toDto(InfoDetailGroupResDto),
    );

    const totalRecords = await this.memberInGroupRepository.countBy({
      memberId: userId,
    });
    const meta = new OffsetPaginationDto(
      totalRecords,
      filterOptions as PageOptionsDto,
    );

    return new OffsetPaginatedDto(responseData, meta);
  }

  async inviteMemberToGroup(
    userId: Uuid,
    groupId: Uuid,
    dto: InviteMemberToGroupReqDto,
  ) {
    const isUserHasRoleHostInGroup =
      await this.memberInGroupService.isUserHasRoleHostInGroup(userId, groupId);
    if (!isUserHasRoleHostInGroup) {
      throw new ForbiddenException(ErrorCode.A009);
    }
    const group = await this.findById(groupId);
    dto.emails.map(
      async (email) =>
        await this.mailService.inviteMemberToGroup(email, group.id, group.name),
    );
  }

  async joinGroup(userId: Uuid, groupId: Uuid) {
    const group = await this.findById(groupId);
    const isUserInGroup = await this.memberInGroupService.isUserInGroup(
      userId,
      groupId,
    );

    if (isUserInGroup) {
      throw new ForbiddenException(ErrorCode.A014);
    }

    await this.memberInGroupService.addMemberToGroup(
      userId,
      RoleInGroup.MEMBER,
      group,
    );
  }

  async findById(id: Uuid) {
    return Optional.of(
      await this.groupRepository.findOne({
        where: { id },
      }),
    )
      .throwIfNotPresent(new NotFoundException(ErrorCode.E009))
      .get();
  }

  async getMemberInGroup(groupId: Uuid, userId: Uuid) {
    const isUserInGroup = await this.memberInGroupService.isUserInGroup(
      userId,
      groupId,
    );

    if (!isUserInGroup) {
      throw new ForbiddenException(ErrorCode.A014);
    }

    return await this.memberInGroupRepository.getMemberInGroup(groupId);
  }

  async getInfoDetailGroup(groupId: Uuid, userId: Uuid) {
    const isUserInGroup = await this.memberInGroupService.isUserInGroup(
      userId,
      groupId,
    );

    if (!isUserInGroup) {
      throw new ForbiddenException(ErrorCode.A014);
    }

    const group = await this.findById(groupId);
    return group.toDto(InfoGroupResDto);
  }

  async deleteGroup(groupId: Uuid, userId: Uuid) {
    const isUserHasRoleHostInGroup =
      await this.memberInGroupService.isUserHasRoleHostInGroup(userId, groupId);

    if (!isUserHasRoleHostInGroup) {
      throw new ForbiddenException(ErrorCode.A009);
    }
    await this.groupRepository.softDelete({ id: groupId });
  }
}
