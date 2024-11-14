import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { Uuid } from '@common/types/common.type';
import { CreateGroupReqDto } from '@modules/group/dto/request/create-group.req.dto';
import { GroupRepository } from '@modules/group/repository/group.repository';
import { Injectable } from '@nestjs/common';

import { OffsetPaginationDto } from '@common/dto/offset-pagination/offset-pagination.dto';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { InfoDetailGroupResDto } from '@modules/group/dto/response/info-detail-group.res.dto';
import { InfoGroupResDto } from '@modules/group/dto/response/info-group.res.dto';
import { GroupEntity } from '@modules/group/entity/group.entity';
import { RoleInGroup } from '@modules/group/enums/role-in-group.enum';
import { MemberInGroupService } from '@modules/group/member-in-group.service';
import { MemberInGroupRepository } from '@modules/group/repository/member-in-group.repository';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class GroupService {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly memberInGroupRepository: MemberInGroupRepository,
    private readonly memberInGroupService: MemberInGroupService,
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
}
