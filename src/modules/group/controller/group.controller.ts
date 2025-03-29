import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { Uuid } from '@common/types/common.type';
import { ActionList, ResourceList } from '@core/constants/app.constant';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { ApiAuth } from '@core/decorators/http.decorators';
import { ValidateUuid } from '@core/decorators/validators/uuid-validator';
import { PermissionGuard } from '@core/guards/permission.guard';
import { CreateGroupReqDto } from '@modules/group/dto/request/create-group.req.dto';
import { InviteMemberToGroupReqDto } from '@modules/group/dto/request/invite-member-to-group.req.dto';
import { InfoGroupResDto } from '@modules/group/dto/response/info-group.res.dto';
import { GroupService } from '@modules/group/service/group.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';

@Controller({ version: '1' })
@ApiTags('Group APIs')
@UseGuards(PermissionGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @ApiAuth({
    summary: 'Create a group',
    statusCode: HttpStatus.CREATED,
    type: InfoGroupResDto,
    permissions: [
      { resource: ResourceList.GROUP, actions: [ActionList.CREATE] },
    ],
  })
  @Post('groups')
  async createGroup(
    @CurrentUser('id') userId: Uuid,
    @Body() dto: CreateGroupReqDto,
  ) {
    return this.groupService.createGroup(userId, dto);
  }

  @ApiAuth({
    summary: 'Get my group',
    type: InfoGroupResDto,
    isPaginated: true,
    paginationType: 'offset',
    permissions: [{ resource: ResourceList.GROUP, actions: [ActionList.READ] }],
  })
  @Get('groups')
  async getGroups(
    @CurrentUser('id') userId: Uuid,
    @Query() filterOptions: PageOptionsDto,
  ) {
    return this.groupService.getMyGroup(userId, filterOptions);
  }

  @ApiAuth({
    summary: 'Invite member to group',
    permissions: [
      { resource: ResourceList.GROUP, actions: [ActionList.UPDATE] },
    ],
  })
  @ApiParam({
    name: 'groupId',
    description: 'The UUID of the Group',
    type: 'string',
  })
  @Post('groups/:groupId/members')
  async inviteMemberToGroup(
    @Param('groupId', ValidateUuid) groupId: Uuid,
    @Body() dto: InviteMemberToGroupReqDto,
    @CurrentUser('id') userId: Uuid,
  ) {
    return this.groupService.inviteMemberToGroup(userId, groupId, dto);
  }

  @ApiAuth({
    summary: 'Get member in group',
    permissions: [{ resource: ResourceList.GROUP, actions: [ActionList.READ] }],
  })
  @ApiParam({
    name: 'groupId',
    description: 'The UUID of the Group',
    type: 'string',
  })
  @Get('groups/:groupId/members')
  async getMemberInGroup(
    @Param('groupId', ValidateUuid) groupId: Uuid,
    @CurrentUser('id') userId: Uuid,
  ) {
    return this.groupService.getMemberInGroup(groupId, userId);
  }

  @ApiAuth({
    summary: 'Member joins group',
    permissions: [
      { resource: ResourceList.GROUP, actions: [ActionList.UPDATE] },
    ],
  })
  @ApiParam({
    name: 'groupId',
    description: 'The UUID of the Group',
    type: 'string',
  })
  @Post('groups/:groupId/members/joins')
  async joinGroup(
    @CurrentUser('id') userId: Uuid,
    @Param('groupId', ValidateUuid) groupId: Uuid,
  ) {
    return this.groupService.joinGroup(userId, groupId);
  }

  @ApiAuth({
    summary: 'Get info detail group',
    permissions: [{ resource: ResourceList.GROUP, actions: [ActionList.READ] }],
  })
  @ApiParam({
    name: 'groupId',
    description: 'The UUID of the Group',
    type: 'string',
  })
  @Get('groups/:groupId')
  async getDetailGroup(
    @CurrentUser('id') userId: Uuid,
    @Param('groupId', ValidateUuid) groupId: Uuid,
  ) {
    return this.groupService.getInfoDetailGroup(groupId, userId);
  }

  @ApiAuth({
    summary: 'Delete group',
    permissions: [
      { resource: ResourceList.GROUP, actions: [ActionList.DELETE] },
    ],
  })
  @ApiParam({
    name: 'groupId',
    description: 'The UUID of the Group',
    type: 'string',
  })
  @Delete('groups/:groupId')
  async deleteGroup(
    @CurrentUser('id') userId: Uuid,
    @Param('groupId', ValidateUuid) groupId: Uuid,
  ) {
    return this.groupService.deleteGroup(groupId, userId);
  }
}
