/* eslint-disable @typescript-eslint/no-unused-vars */
import { Uuid } from '@common/types/common.type';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { ApiAuth } from '@core/decorators/http.decorators';
import { UpdateUserInfoDto } from '@modules/user/dto/request/update-user-info.req.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/request/create-user.req.dto';
import { ListUserReqDto } from './dto/request/list-user.req.dto';
import { LoadMoreUsersReqDto } from './dto/request/load-more-users.req.dto';
import { UpdateUserReqDto } from './dto/request/update-user.req.dto';
import { UserResDto } from './dto/response/user.res.dto';
import { UserService } from './user.service';

@ApiTags('users')
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

  @Post()
  @ApiAuth({
    type: UserResDto,
    summary: 'Create user',
    statusCode: HttpStatus.CREATED,
  })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return 'create a user';
  }

  @Patch('profile/me')
  @ApiAuth({ type: UserResDto, summary: 'Update my profile' })
  updateMyInfo(
    @CurrentUser('id') userId: Uuid,
    @Body() dto: UpdateUserInfoDto,
  ) {
    return this.userService.updateUserInfo(userId, dto);
  }

  @Get()
  @ApiAuth({
    type: UserResDto,
    summary: 'List users',
    isPaginated: true,
  })
  async findAllUsers(@Query() reqDto: ListUserReqDto) {
    return 'get all user';
  }

  @Get('/load-more')
  @ApiAuth({
    type: UserResDto,
    summary: 'Load more users',
    isPaginated: true,
    paginationType: 'cursor',
  })
  async loadMoreUsers(@Query() reqDto: LoadMoreUsersReqDto) {
    return 'load more users';
  }

  @Get(':id')
  @ApiAuth({ type: UserResDto, summary: 'Find user by id' })
  @ApiParam({ name: 'id', type: 'String' })
  async findUser(@Param('id', ParseUUIDPipe) id: Uuid) {
    return 'find one user';
  }

  @Patch(':id')
  @ApiAuth({ type: UserResDto, summary: 'Update user' })
  @ApiParam({ name: 'id', type: 'String' })
  updateUser(
    @Param('id', ParseUUIDPipe) id: Uuid,
    @Body() reqDto: UpdateUserReqDto,
  ) {
    return 'update user';
  }

  @Delete(':id')
  @ApiAuth({
    summary: 'Delete user',
    errorResponses: [400, 401, 403, 404, 500],
  })
  @ApiParam({ name: 'id', type: 'String' })
  removeUser(@Param('id', ParseUUIDPipe) id: Uuid) {
    return 'remove user';
  }

  @ApiAuth()
  @Post('me/change-password')
  async changePassword() {
    return 'change-password';
  }
}
