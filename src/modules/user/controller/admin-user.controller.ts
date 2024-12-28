import { Uuid } from '@common/types/common.type';
import { ActionList, ResourceList } from '@core/constants/app.constant';
import { ROLE } from '@core/constants/entity.enum';
import { ApiAuth } from '@core/decorators/http.decorators';
import { ValidateUuid } from '@core/decorators/validators/uuid-validator';
import { PermissionGuard } from '@core/guards/permission.guard';
import { RolesGuard } from '@core/guards/role.guard';
import { AdminQueryUserReqDto } from '@modules/user/dto/request/admin-query-user.req.dto';
import { UpdateUserInfoDto } from '@modules/user/dto/request/update-user-info.req.dto';
import { UserService } from '@modules/user/user.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { UserResDto } from '../dto/response/user.res.dto';

@ApiTags('Admin User APIs')
@Controller({
  path: '/admin/users',
  version: '1',
})
@UseGuards(PermissionGuard)
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  @ApiAuth({
    summary: 'Get list user',
    roles: [ROLE.ADMIN],
    type: UserResDto,
    isPaginated: true,
    paginationType: 'offset',
    permissions: [
      { resource: ResourceList.USER, actions: [ActionList.READ_ALL] },
    ],
  })
  @Get()
  async getListUser(@Query() filterOptions: AdminQueryUserReqDto) {
    return this.userService.getListUser(filterOptions);
  }

  @ApiAuth({
    summary: 'Soft delete user',
    statusCode: HttpStatus.NO_CONTENT,
    permissions: [
      { resource: ResourceList.USER, actions: [ActionList.DELETE] },
    ],
  })
  @ApiParam({
    name: 'userId',
    description: 'The UUID of the User',
    type: 'string',
  })
  @Delete(':userId')
  deleteUser(@Param('userId', ValidateUuid) userId: Uuid) {
    return this.userService.deleteUser(userId);
  }

  @ApiAuth({
    summary: 'Restore user',
    roles: [ROLE.ADMIN],
  })
  @ApiParam({
    name: 'userId',
    description: 'The UUID of the User',
    type: 'string',
  })
  @UseGuards(RolesGuard)
  @Put(':userId/restore')
  restoreUser(@Param('userId', ValidateUuid) userId: Uuid) {
    return this.userService.restoreUser(userId);
  }

  @ApiAuth({
    type: UserResDto,
    summary: 'Update user profile',
    roles: [ROLE.ADMIN],
  })
  @ApiParam({
    name: 'userId',
    description: 'The UUID of the User',
    type: 'string',
  })
  @UseGuards(RolesGuard)
  @Patch(':userId')
  updateUserInfo(
    @Body() dto: UpdateUserInfoDto,
    @Param('userId', ValidateUuid) userId: Uuid,
  ) {
    return this.userService.updateUserInfo(userId, dto);
  }

  @ApiAuth({
    type: UserResDto,
    summary: 'Get info detail user by id',
    roles: [ROLE.ADMIN],
  })
  @ApiParam({
    name: 'userId',
    description: 'The UUID of the User',
    type: 'string',
  })
  @Get(':userId')
  async getInfoDetailUser(@Param('userId', ValidateUuid) userId: Uuid) {
    return this.userService.getUserInfo(userId);
  }
}
