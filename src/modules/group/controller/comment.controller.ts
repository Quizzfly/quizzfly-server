import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { Uuid } from '@common/types/common.type';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { ApiAuth } from '@core/decorators/http.decorators';
import { ValidateUuid } from '@core/decorators/validators/uuid-validator';
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
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';

@Controller({ version: '1' })
@ApiTags('Comment APIs')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

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
    return this.commentService.commentPost(userId, postId, dto);
  }

  @ApiAuth({
    summary: 'Edit comment post',
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
    summary: 'Get child comment post',
    type: InfoCommentPostResDto,
    isPaginated: true,
    paginationType: 'offset',
  })
  @ApiParam({
    name: 'parentCommentId',
    description: 'The UUID of the parent comment',
    type: 'string',
  })
  @Get('/comments/:parentCommentId/childs')
  async getListChildCommentInPost(
    @CurrentUser('id') userId: Uuid,
    @Param('parentCommentId', ValidateUuid) parentCommentId: Uuid,
    @Query() filterOptions: PageOptionsDto,
  ) {
    return this.commentService.getChildCommentInPost(
      userId,
      parentCommentId,
      filterOptions,
    );
  }
}
