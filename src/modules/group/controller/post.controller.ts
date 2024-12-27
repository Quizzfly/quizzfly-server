import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { Uuid } from '@common/types/common.type';
import { ActionList, ResourceList } from '@core/constants/app.constant';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { ApiAuth } from '@core/decorators/http.decorators';
import { ValidateUuid } from '@core/decorators/validators/uuid-validator';
import { PermissionGuard } from '@core/guards/permission.guard';
import { CreatePostReqDto } from '@modules/group/dto/request/create-post.req.dto';
import { InfoPostResDto } from '@modules/group/dto/response/info-post.res.dto';
import { PostService } from '@modules/group/service/post.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';

@Controller({ version: '1' })
@ApiTags('Post APIs')
@UseGuards(PermissionGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiAuth({
    summary: 'Create a post',
    statusCode: HttpStatus.CREATED,
    type: InfoPostResDto,
    permissions: [
      { resource: ResourceList.GROUP, actions: [ActionList.CREATE] },
    ],
  })
  @ApiParam({
    name: 'groupId',
    description: 'The UUID of the Group',
    type: 'string',
  })
  @Post('groups/:groupId/posts')
  async createPost(
    @CurrentUser('id') userId: Uuid,
    @Param('groupId', ValidateUuid) groupId: Uuid,
    @Body() dto: CreatePostReqDto,
  ) {
    return this.postService.createPost(userId, groupId, dto);
  }

  @ApiAuth({
    summary: 'Get list post',
    type: InfoPostResDto,
    isPaginated: true,
    paginationType: 'offset',
    permissions: [{ resource: ResourceList.GROUP, actions: [ActionList.READ] }],
  })
  @ApiParam({
    name: 'groupId',
    description: 'The UUID of the Group',
    type: 'string',
  })
  @Get('groups/:groupId/posts')
  async getListPost(
    @CurrentUser('id') userId: Uuid,
    @Param('groupId', ValidateUuid) groupId: Uuid,
    @Query() filterOptions: PageOptionsDto,
  ) {
    return this.postService.getListPost(groupId, userId, filterOptions);
  }

  @ApiAuth({
    summary: 'Get info detail post',
    permissions: [{ resource: ResourceList.GROUP, actions: [ActionList.READ] }],
  })
  @ApiParam({
    name: 'groupId',
    description: 'The UUID of the Group',
    type: 'string',
  })
  @ApiParam({
    name: 'postId',
    description: 'The UUID of the post',
    type: 'string',
  })
  @Get('groups/:groupId/posts/:postId')
  async getDetailPost(
    @CurrentUser('id') userId: Uuid,
    @Param('groupId', ValidateUuid) groupId: Uuid,
    @Param('postId', ValidateUuid) postId: Uuid,
  ) {
    return this.postService.getInfoDetailPost(groupId, postId, userId);
  }

  @ApiAuth({
    summary: 'Delete a post',
    permissions: [
      { resource: ResourceList.GROUP, actions: [ActionList.DELETE] },
    ],
  })
  @ApiParam({
    name: 'postId',
    description: 'The UUID of the post',
    type: 'string',
  })
  @Delete('posts/:postId')
  async deletePost(
    @CurrentUser('id') userId: Uuid,
    @Param('postId', ValidateUuid) postId: Uuid,
  ) {
    return this.postService.deletePost(postId, userId);
  }

  @ApiAuth({
    summary: 'Update info post',
    permissions: [
      { resource: ResourceList.GROUP, actions: [ActionList.UPDATE] },
    ],
  })
  @ApiParam({
    name: 'postId',
    description: 'The UUID of the post',
    type: 'string',
  })
  @Put('/posts/:postId')
  async updatePost(
    @CurrentUser('id') userId: Uuid,
    @Param('postId', ValidateUuid) postId: Uuid,
    @Body() dto: CreatePostReqDto,
  ) {
    return this.postService.updatePost(postId, userId, dto);
  }

  @ApiAuth({
    summary: 'React post',
    permissions: [
      { resource: ResourceList.GROUP, actions: [ActionList.UPDATE] },
    ],
  })
  @ApiParam({
    name: 'postId',
    description: 'The UUID of the post',
    type: 'string',
  })
  @Post('/posts/:postId/reacts')
  async reactPost(
    @CurrentUser('id') userId: Uuid,
    @Param('postId', ValidateUuid) postId: Uuid,
  ) {
    return this.postService.reactPost(userId, postId);
  }
}
