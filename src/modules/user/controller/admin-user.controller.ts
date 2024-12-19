import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { Uuid } from '@common/types/common.type';
import { ROLE } from '@core/constants/entity.enum';
import { ApiAuth } from '@core/decorators/http.decorators';
import { ValidateUuid } from '@core/decorators/validators/uuid-validator';
import { RolesGuard } from '@core/guards/role.guard';
import { UpdateUserInfoDto } from '@modules/user/dto/request/update-user-info.req.dto';
import { UserService } from '@modules/user/user.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  @ApiAuth({
    summary: 'Get list user',
    roles: [ROLE.ADMIN],
    type: UserResDto,
    isPaginated: true,
    paginationType: 'offset',
  })
  @UseGuards(RolesGuard)
  @Get()
  async getListUser(@Query() filterOptions: PageOptionsDto) {
    return await this.userService.getListUser(filterOptions);
  }

  @ApiAuth({
    summary: 'Soft delete user',
    roles: [ROLE.ADMIN],
  })
  @ApiParam({
    name: 'userId',
    description: 'The UUID of the User',
    type: 'string',
  })
  @UseGuards(RolesGuard)
  @Delete(':userId')
  async deleteUser(@Param('userId', ValidateUuid) userId: Uuid) {
    return await this.userService.deleteUser(userId);
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
  @Post(':userId/restore')
  async restoreUser(@Param('userId', ValidateUuid) userId: Uuid) {
    return await this.userService.restoreUser(userId);
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
