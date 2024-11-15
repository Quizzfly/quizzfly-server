import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { Uuid } from '@common/types/common.type';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { ApiAuth } from '@core/decorators/http.decorators';
import { ValidateUuid } from '@core/decorators/validators/uuid-validator';
import { CreateGroupReqDto } from '@modules/group/dto/request/create-group.req.dto';
import { InviteMemberToGroupReqDto } from '@modules/group/dto/request/invite-member-to-group.req.dto';
import { InfoGroupResDto } from '@modules/group/dto/response/info-group.res.dto';
import { GroupService } from '@modules/group/group.service';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';

@Controller({ version: '1' })
@ApiTags('Group APIs')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @ApiAuth({
    summary: 'Create a group',
    statusCode: HttpStatus.CREATED,
    type: InfoGroupResDto,
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
  })
  @ApiParam({
    name: 'groupId',
    description: 'The UUID of the Group',
    type: 'string',
  })
  @Post('group/:groupId/members/joins')
  async joinGroup(
    @CurrentUser('id') userId: Uuid,
    @Param('groupId', ValidateUuid) groupId: Uuid,
  ) {
    return this.groupService.joinGroup(userId, groupId);
  }
}
