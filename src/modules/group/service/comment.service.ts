import { OffsetPaginationDto } from '@common/dto/offset-pagination/offset-pagination.dto';
import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@common/types/common.type';
import { ErrorCode } from '@core/constants/error-code/error-code.constant';
import { Optional } from '@core/utils/optional';
import { CommentPostReqDto } from '@modules/group/dto/request/comment-post.req.dto';
import { InfoCommentPostResDto } from '@modules/group/dto/response/info-comment-post.res.dto';
import { CommentPostEntity } from '@modules/group/entity/comment-post.entity';
import { CommentPostRepository } from '@modules/group/repository/comment-post.repository';
import { MemberInGroupService } from '@modules/group/service/member-in-group.service';
import { PostService } from '@modules/group/service/post.service';
import { GroupEvent } from '@modules/group/socket/enums/group-event.enum';
import { GroupSocketGateway } from '@modules/group/socket/group-socket.gateway';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentPostRepository: CommentPostRepository,
    private readonly memberInGroupService: MemberInGroupService,
    private readonly postService: PostService,
    private readonly groupSocketGateway: GroupSocketGateway,
  ) {}

  async commentPost(userId: Uuid, postId: Uuid, dto: CommentPostReqDto) {
    const post = await this.postService.findById(postId);
    await this.memberInGroupService.isUserInGroup(userId, post.groupId);

    const commentPost = new CommentPostEntity({
      ...dto,
      memberId: userId,
      postId: postId,
      parentCommentId: dto.parentCommentId,
    });
    await this.commentPostRepository.save(commentPost);

    this.groupSocketGateway.sendToGroup(
      post.groupId,
      GroupEvent.COMMENT_POST,
      commentPost,
    );
    return commentPost.toDto(InfoCommentPostResDto);
  }

  async editCommentPost(userId: Uuid, commentId: Uuid, dto: CommentPostReqDto) {
    const comment = await this.findById(commentId);

    if (comment.memberId !== userId) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }

    Object.assign(comment, dto);
    await this.commentPostRepository.save(comment);
    return comment.toDto(InfoCommentPostResDto);
  }

  async deleteCommentPost(userId: Uuid, commentId: Uuid) {
    const comment = await this.findById(commentId);

    if (comment.memberId !== userId) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }

    await this.commentPostRepository.softDelete({ id: commentId });
  }

  async findById(id: Uuid) {
    return Optional.of(
      await this.commentPostRepository.findOne({
        where: { id },
      }),
    )
      .throwIfNotPresent(new NotFoundException(ErrorCode.COMMENT_NOT_FOUND))
      .get();
  }

  async getCommentInPost(
    userId: Uuid,
    postId: Uuid,
    filterOptions: PageOptionsDto,
  ) {
    const post = await this.postService.findById(postId);
    await this.memberInGroupService.isUserInGroup(userId, post.groupId);

    const comments: Array<any> =
      await this.commentPostRepository.getCommentInPost(postId, filterOptions);

    const totalRecords = await this.commentPostRepository.countBy({
      postId: postId,
    });
    const meta = new OffsetPaginationDto(
      totalRecords,
      filterOptions as PageOptionsDto,
    );

    return new OffsetPaginatedDto(
      plainToInstance(InfoCommentPostResDto, comments, {
        excludeExtraneousValues: true,
      }),
      meta,
    );
  }

  async getChildCommentInPost(
    userId: Uuid,
    parentCommentId: Uuid,
    filterOptions: PageOptionsDto,
  ) {
    const comments: Array<any> =
      await this.commentPostRepository.getChildComment(
        parentCommentId,
        filterOptions,
      );

    const totalRecords = await this.commentPostRepository.countBy({
      parentCommentId: parentCommentId,
    });
    const meta = new OffsetPaginationDto(
      totalRecords,
      filterOptions as PageOptionsDto,
    );

    return new OffsetPaginatedDto(
      plainToInstance(InfoCommentPostResDto, comments, {
        excludeExtraneousValues: true,
      }),
      meta,
    );
  }
}
