import { Uuid } from '@common/types/common.type';
import { ActionList, ResourceList } from '@core/constants/app.constant';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { ApiAuth } from '@core/decorators/http.decorators';
import { ValidateUuid } from '@core/decorators/validators/uuid-validator';
import { PermissionGuard } from '@core/guards/permission.guard';
import { ChangePasswordReqDto } from '@modules/user/dto/request/change-password.req';
import { UpdateUserInfoDto } from '@modules/user/dto/request/update-user-info.req.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { UserResDto } from '../dto/response/user.res.dto';
import { UserService } from '../user.service';

@ApiTags('User APIs')
@Controller({
  path: 'users',
  version: '1',
})
@UseGuards(PermissionGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiAuth({
    summary: 'Get current user',
    type: UserResDto,
    permissions: [{ resource: ResourceList.USER, actions: [ActionList.READ] }],
  })
  @Get('me')
  async getCurrentUser(@CurrentUser('id') userId: Uuid) {
    return this.userService.getUserInfo(userId);
  }

  @ApiAuth({
    summary: 'Get info detail user by id',
    type: UserResDto,
    permissions: [{ resource: ResourceList.USER, actions: [ActionList.READ] }],
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

  @Patch('profile/me')
  @ApiAuth({
    summary: 'Update my profile',
    type: UserResDto,
    permissions: [
      { resource: ResourceList.USER, actions: [ActionList.UPDATE] },
    ],
  })
  updateMyInfo(
    @CurrentUser('id') userId: Uuid,
    @Body() dto: UpdateUserInfoDto,
  ) {
    return this.userService.updateUserInfo(userId, dto);
  }

  @ApiAuth({
    summary: 'Change password',
    statusCode: HttpStatus.NO_CONTENT,
    permissions: [
      { resource: ResourceList.USER, actions: [ActionList.UPDATE] },
    ],
  })
  @Post('change-password')
  async changePassword(
    @Body() dto: ChangePasswordReqDto,
    @CurrentUser('id') userId: Uuid,
  ) {
    return this.userService.changePassword(dto, userId);
  }

  @ApiAuth({
    summary: 'Request delete account',
    statusCode: HttpStatus.NO_CONTENT,
    permissions: [
      { resource: ResourceList.USER, actions: [ActionList.UPDATE] },
    ],
  })
  @Post('request-delete')
  async requestDeleteAccount(@CurrentUser('id') userId: Uuid) {
    return await this.userService.requestDeleteAccount(userId);
  }

  @ApiAuth({
    summary: 'Verify delete account',
    statusCode: HttpStatus.NO_CONTENT,
    permissions: [
      { resource: ResourceList.USER, actions: [ActionList.UPDATE] },
    ],
  })
  @Delete('verify-delete')
  async verifyDeleteAccount(
    @CurrentUser('id') userId: Uuid,
    @Query('code') code: string,
  ) {
    return await this.userService.verifyDeleteAccount(userId, code);
  }
}
