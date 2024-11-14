import { Body, Controller, Get, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GroupService } from '@modules/group/group.service';
import { ApiAuth } from '@core/decorators/http.decorators';
import { InfoGroupResDto } from '@modules/group/dto/response/info-group.res.dto';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { Uuid } from '@common/types/common.type';
import { CreateGroupReqDto } from '@modules/group/dto/request/create-group.req.dto';
import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';

@Controller({version: '1'})
@ApiTags('Group APIs')
export class GroupController {

  constructor(private readonly groupService: GroupService) {}

  @ApiAuth({
    summary: 'Create a group',
    statusCode: HttpStatus.CREATED,
    type: InfoGroupResDto
  })
  @Post('groups')
  async createGroup(@CurrentUser('id') userId: Uuid, @Body() dto: CreateGroupReqDto) {
    return this.groupService.createGroup(userId, dto);
  }

  @ApiAuth({
    summary: 'Get my group',
    type: InfoGroupResDto,
    isPaginated: true,
    paginationType: 'offset',
  })
  @Get('groups')
  async getGroups(@CurrentUser('id') userId: Uuid, @Query() filterOptions: PageOptionsDto) {
    return this.groupService.getMyGroup(userId, filterOptions);
  }
}
