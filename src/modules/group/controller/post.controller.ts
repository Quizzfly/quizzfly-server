import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { Uuid } from '@common/types/common.type';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { ApiAuth } from '@core/decorators/http.decorators';
import { ValidateUuid } from '@core/decorators/validators/uuid-validator';
import { CommentPostReqDto } from '@modules/group/dto/request/comment-post.req.dto';
import { CreatePostReqDto } from '@modules/group/dto/request/create-post.req.dto';
import { InfoCommentPostResDto } from '@modules/group/dto/response/info-comment-post.res.dto';
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
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';

@Controller({ version: '1' })
@ApiTags('Post APIs')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiAuth({
    summary: 'Create a post',
    statusCode: HttpStatus.CREATED,
    type: InfoPostResDto,
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

  @ApiAuth({
    summary: 'Comment post',
  })
  @ApiParam({
    name: 'postId',
    description: 'The UUID of the post',
    type: 'string',
  })
  @Post('/posts/:postId/comments')
  async commentPost(
    @CurrentUser('id') userId: Uuid,
    @Param('postId', ValidateUuid) postId: Uuid,
    @Body() dto: CommentPostReqDto,
  ) {
    return this.postService.commentPost(userId, postId, dto);
  }

  @ApiAuth({
    summary: 'Get comment post',
    type: InfoCommentPostResDto,
    isPaginated: true,
    paginationType: 'offset',
  })
  @ApiParam({
    name: 'postId',
    description: 'The UUID of the post',
    type: 'string',
  })
  @Get('/posts/:postId/comments')
  async getListCommentInPost(
    @CurrentUser('id') userId: Uuid,
    @Param('postId', ValidateUuid) postId: Uuid,
    @Query() filterOptions: PageOptionsDto,
  ) {
    return this.postService.getCommentInPost(userId, postId, filterOptions);
  }
}
