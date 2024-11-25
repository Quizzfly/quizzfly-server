import { Uuid } from '@common/types/common.type';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { ApiAuth } from '@core/decorators/http.decorators';
import { ValidateUuid } from '@core/decorators/validators/uuid-validator';
import { ChangePasswordReqDto } from '@modules/user/dto/request/change-password.req';
import { UpdateUserInfoDto } from '@modules/user/dto/request/update-user-info.req.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { UserResDto } from './dto/response/user.res.dto';
import { UserService } from './user.service';

@ApiTags('User APIs')
@Controller({
  path: 'users',
  version: '1',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiAuth({
    type: UserResDto,
    summary: 'Get current user',
  })
  @Get('me')
  async getCurrentUser(@CurrentUser('id') userId: Uuid) {
    return this.userService.getUserInfo(userId);
  }

  @ApiAuth({
    type: UserResDto,
    summary: 'Get info detail user by id',
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
  @ApiAuth({ type: UserResDto, summary: 'Update my profile' })
  updateMyInfo(
    @CurrentUser('id') userId: Uuid,
    @Body() dto: UpdateUserInfoDto,
  ) {
    return this.userService.updateUserInfo(userId, dto);
  }

  @ApiAuth({ summary: 'Change password' })
  @Post('change-password')
  async changePassword(
    @Body() dto: ChangePasswordReqDto,
    @CurrentUser('id') userId: Uuid,
  ) {
    return this.userService.changePassword(dto, userId);
  }

  @ApiAuth({ summary: 'Request delete account' })
  @Post('request-delete')
  async requestDeleteAccount(@CurrentUser('id') userId: Uuid) {
    return await this.userService.requestDeleteAccount(userId);
  }

  @ApiAuth({ summary: 'Verify delete account' })
  @Delete('verify-delete')
  async verifyDeleteAccount(
    @CurrentUser('id') userId: Uuid,
    @Query('code') code: string,
  ) {
    return await this.userService.verifyDeleteAccount(userId, code);
  }
}
