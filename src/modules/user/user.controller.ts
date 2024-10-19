import { Uuid } from '@common/types/common.type';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { ApiAuth } from '@core/decorators/http.decorators';
import { ChangePasswordReqDto } from '@modules/user/dto/request/change-password.req';
import { UpdateUserInfoDto } from '@modules/user/dto/request/update-user-info.req.dto';
import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
}
