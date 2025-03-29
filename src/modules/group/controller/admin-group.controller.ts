import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { RangeDateDto } from '@common/dto/range-date.dto';
import { Uuid } from '@common/types/common.type';
import { ROLE } from '@core/constants/entity.enum';
import { ApiAuth } from '@core/decorators/http.decorators';
import { ValidateUuid } from '@core/decorators/validators/uuid-validator';
import { RolesGuard } from '@core/guards/role.guard';
import { InfoCommentPostResDto } from '@modules/group/dto/response/info-comment-post.res.dto';
import { InfoGroupResDto } from '@modules/group/dto/response/info-group.res.dto';
import { InfoPostResDto } from '@modules/group/dto/response/info-post.res.dto';
import { CommentService } from '@modules/group/service/comment.service';
import { GroupService } from '@modules/group/service/group.service';
import { PostService } from '@modules/group/service/post.service';
import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';

@Controller({ path: '/admin', version: '1' })
@ApiTags('Admin Group APIs')
export class AdminGroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly postService: PostService,
    private readonly commentService: CommentService,
  ) {}

  @ApiAuth({
    summary: 'Get list group by admin',
    roles: [ROLE.ADMIN],
    type: InfoGroupResDto,
    isPaginated: true,
    paginationType: 'offset',
  })
  @UseGuards(RolesGuard)
  @Get('groups')
  async getListGroup(@Query() filterOptions: PageOptionsDto) {
    return this.groupService.getListGroupByAdmin(filterOptions);
  }

  @ApiAuth({
    summary: 'Count group by admin',
    roles: [ROLE.ADMIN],
  })
  @ApiParam({
    name: 'isTotal',
    description: 'Is count total group by admin',
    type: 'boolean',
  })
  @UseGuards(RolesGuard)
  @Get('groups/count')
  async countGroup(
    @Query() rangeDateDto: RangeDateDto,
    @Param('isTotal') isTotal: boolean,
  ) {
    return this.groupService.countGroupByAdmin(rangeDateDto, isTotal);
  }

  @ApiAuth({
    summary: 'Delete group by admin',
    roles: [ROLE.ADMIN],
  })
  @ApiParam({
    name: 'groupId',
    description: 'The UUID of the Group',
    type: 'string',
  })
  @UseGuards(RolesGuard)
  @Delete('groups/:groupId')
  async deleteGroup(@Param('groupId', ValidateUuid) groupId: Uuid) {
    return this.groupService.deleteGroupByAdmin(groupId);
  }

  @ApiAuth({
    summary: 'Get list post in group by admin',
    roles: [ROLE.ADMIN],
    type: InfoPostResDto,
    isPaginated: true,
    paginationType: 'offset',
  })
  @ApiParam({
    name: 'groupId',
    description: 'The UUID of the Group',
    type: 'string',
  })
  @UseGuards(RolesGuard)
  @Get('/groups/:groupId/posts')
  async getListPostInGroup(
    @Param('groupId', ValidateUuid) groupId: Uuid,
    @Query() filterOptions: PageOptionsDto,
  ) {
    return this.postService.getListPostByAdmin(groupId, filterOptions);
  }

  @ApiAuth({
    summary: 'Delete post in group by admin',
    roles: [ROLE.ADMIN],
  })
  @ApiParam({
    name: 'postId',
    description: 'The UUID of the post',
    type: 'string',
  })
  @UseGuards(RolesGuard)
  @Delete('posts/:postId')
  async deletePostByAdmin(@Param('postId', ValidateUuid) postId: Uuid) {
    return this.postService.deletePostByAdmin(postId);
  }

  @ApiAuth({
    summary: 'Get info detail post by admin',
    type: InfoPostResDto,
    roles: [ROLE.ADMIN],
  })
  @ApiParam({
    name: 'postId',
    description: 'The UUID of the post',
    type: 'string',
  })
  @Get('posts/:postId')
  async getDetailPostByAdmin(@Param('postId', ValidateUuid) postId: Uuid) {
    return this.postService.getInfoPostByAdmin(postId);
  }

  @ApiAuth({
    summary: 'Get comment post by admin',
    type: InfoCommentPostResDto,
    isPaginated: true,
    paginationType: 'offset',
    roles: [ROLE.ADMIN],
  })
  @ApiParam({
    name: 'postId',
    description: 'The UUID of the post',
    type: 'string',
  })
  @Get('/posts/:postId/comments')
  async getListCommentInPost(
    @Param('postId', ValidateUuid) postId: Uuid,
    @Query() filterOptions: PageOptionsDto,
  ) {
    return this.commentService.getCommentPostByAdmin(postId, filterOptions);
  }

  @ApiAuth({
    summary: 'Get reply comment post by admin',
    type: InfoCommentPostResDto,
    isPaginated: true,
    paginationType: 'offset',
    roles: [ROLE.ADMIN],
  })
  @ApiParam({
    name: 'parentCommentId',
    description: 'The UUID of the parent comment',
    type: 'string',
  })
  @Get('comments/:parentCommentId/replies')
  async getListReplyCommentByAdmin(
    @Param('parentCommentId', ValidateUuid) parentCommentId: Uuid,
    @Query() filterOptions: PageOptionsDto,
  ) {
    return this.commentService.getReplyCommentByAdmin(
      parentCommentId,
      filterOptions,
    );
  }

  @ApiAuth({
    summary: 'Delete comment post by admin',
  })
  @ApiParam({
    name: 'commentId',
    description: 'The UUID of the comment',
    type: 'string',
  })
  @Delete('/comments/:commentId')
  async deleteCommentPost(@Param('commentId', ValidateUuid) commentId: Uuid) {
    return this.commentService.deleteCommentPostByAdmin(commentId);
  }
}
