import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { Uuid } from '@common/types/common.type';
import { ActionList, ResourceList } from '@core/constants/app.constant';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { ApiAuth } from '@core/decorators/http.decorators';
import { ValidateUuid } from '@core/decorators/validators/uuid-validator';
import { PermissionGuard } from '@core/guards/permission.guard';
import { CommentPostReqDto } from '@modules/group/dto/request/comment-post.req.dto';
import { InfoCommentPostResDto } from '@modules/group/dto/response/info-comment-post.res.dto';
import { CommentService } from '@modules/group/service/comment.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';

@Controller({ version: '1' })
@ApiTags('Comment APIs')
@UseGuards(PermissionGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiAuth({
    summary: 'Comment post',
    type: InfoCommentPostResDto,
    permissions: [
      { resource: ResourceList.GROUP, actions: [ActionList.CREATE] },
    ],
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
    return this.commentService.commentPost(userId, postId, dto);
  }

  @ApiAuth({
    summary: 'Edit comment post',
    type: InfoCommentPostResDto,
    permissions: [
      { resource: ResourceList.GROUP, actions: [ActionList.UPDATE] },
    ],
  })
  @ApiParam({
    name: 'commentId',
    description: 'The UUID of the comment',
    type: 'string',
  })
  @Put('/comments/:commentId')
  async editCommentPost(
    @CurrentUser('id') userId: Uuid,
    @Param('commentId', ValidateUuid) commentId: Uuid,
    @Body() dto: CommentPostReqDto,
  ) {
    return this.commentService.editCommentPost(userId, commentId, dto);
  }

  @ApiAuth({
    summary: 'Delete comment post',
    permissions: [
      { resource: ResourceList.GROUP, actions: [ActionList.DELETE] },
    ],
  })
  @ApiParam({
    name: 'commentId',
    description: 'The UUID of the comment',
    type: 'string',
  })
  @Delete('/comments/:commentId')
  async deleteCommentPost(
    @CurrentUser('id') userId: Uuid,
    @Param('commentId', ValidateUuid) commentId: Uuid,
  ) {
    return this.commentService.deleteCommentPost(userId, commentId);
  }

  @ApiAuth({
    summary: 'Get comment post',
    type: InfoCommentPostResDto,
    isPaginated: true,
    paginationType: 'offset',
    permissions: [{ resource: ResourceList.GROUP, actions: [ActionList.READ] }],
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
    return this.commentService.getCommentInPost(userId, postId, filterOptions);
  }

  @ApiAuth({
    summary: 'Get reply comment post',
    type: InfoCommentPostResDto,
    isPaginated: true,
    paginationType: 'offset',
    permissions: [{ resource: ResourceList.GROUP, actions: [ActionList.READ] }],
  })
  @ApiParam({
    name: 'parentCommentId',
    description: 'The UUID of the parent comment',
    type: 'string',
  })
  @Get('/comments/:parentCommentId/replies')
  async getListReplyCommentInPost(
    @CurrentUser('id') userId: Uuid,
    @Param('parentCommentId', ValidateUuid) parentCommentId: Uuid,
    @Query() filterOptions: PageOptionsDto,
  ) {
    return this.commentService.getReplyCommentInPost(
      userId,
      parentCommentId,
      filterOptions,
    );
  }
}
