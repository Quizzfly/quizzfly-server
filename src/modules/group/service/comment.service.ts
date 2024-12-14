import { OffsetPaginationDto } from '@common/dto/offset-pagination/offset-pagination.dto';
import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@common/types/common.type';
import { ErrorCode } from '@core/constants/error-code/error-code.constant';
import { Optional } from '@core/utils/optional';
import { CommentPostReqDto } from '@modules/group/dto/request/comment-post.req.dto';
import { InfoCommentPostResDto } from '@modules/group/dto/response/info-comment-post.res.dto';
import { CommentPostEntity } from '@modules/group/entity/comment-post.entity';
import { PostEntity } from '@modules/group/entity/post.entity';
import { CommentPostRepository } from '@modules/group/repository/comment-post.repository';
import { MemberInGroupService } from '@modules/group/service/member-in-group.service';
import { PostService } from '@modules/group/service/post.service';
import { GroupEvent } from '@modules/group/socket/enums/group-event.enum';
import { GroupSocketGateway } from '@modules/group/socket/group-socket.gateway';
import { CreateNotificationDto } from '@modules/notification/dto/request/create-notification.dto';
import { NotificationType } from '@modules/notification/enums/notification-type.enum';
import { TargetType } from '@modules/notification/enums/target-type.enum';
import { PushNotificationService } from '@modules/notification/service/push-notification.service';
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
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  async commentPost(userId: Uuid, postId: Uuid, dto: CommentPostReqDto) {
    const post = await this.postService.findById(postId);
    if (dto.parentCommentId !== null) {
      await this.findById(dto.parentCommentId);
    }
    await this.memberInGroupService.isUserInGroup(userId, post.groupId);

    const commentPost = new CommentPostEntity({
      ...dto,
      memberId: userId,
      postId: postId,
      parentCommentId: dto.parentCommentId,
    });
    await this.commentPostRepository.save(commentPost);
    const savedComment = await this.findById(commentPost.id);
    const response = plainToInstance(InfoCommentPostResDto, savedComment, {
      excludeExtraneousValues: true,
    });

    this.groupSocketGateway.sendToGroup(
      post.groupId,
      GroupEvent.COMMENT_POST,
      response,
    );

    await this.pushNotificationComment(userId, post, commentPost, dto);
    return response;
  }

  async editCommentPost(userId: Uuid, commentId: Uuid, dto: CommentPostReqDto) {
    const comment = await this.findById(commentId);

    if (comment.memberId !== userId) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }

    Object.assign(comment, dto);
    await this.commentPostRepository.save(comment);

    const savedComment = await this.findById(commentId);
    const response = plainToInstance(InfoCommentPostResDto, savedComment, {
      excludeExtraneousValues: true,
    });

    this.groupSocketGateway.sendToGroup(
      comment.post.groupId,
      GroupEvent.UPDATE_COMMENT_POST,
      response,
    );
    return response;
  }

  async deleteCommentPost(userId: Uuid, commentId: Uuid) {
    const comment = await this.findById(commentId);

    if (comment.memberId !== userId) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }

    if (comment.parentCommentId === null) {
      const replyComments = await this.commentPostRepository.findBy({
        parentCommentId: commentId,
      });

      const replyCommentIds = replyComments.map((comment) => comment.id);

      if (replyCommentIds.length > 0) {
        await this.commentPostRepository.softDelete(replyCommentIds);
      }
    }

    this.groupSocketGateway.sendToGroup(
      comment.post.groupId,
      GroupEvent.DELETE_COMMENT_POST,
      plainToInstance(InfoCommentPostResDto, comment, {
        excludeExtraneousValues: true,
      }),
    );
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
    const meta = new OffsetPaginationDto(totalRecords, filterOptions);

    return new OffsetPaginatedDto(
      plainToInstance(InfoCommentPostResDto, comments, {
        excludeExtraneousValues: true,
      }),
      meta,
    );
  }

  async getReplyCommentInPost(
    userId: Uuid,
    parentCommentId: Uuid,
    filterOptions: PageOptionsDto,
  ) {
    const parentComment = await this.findById(parentCommentId);
    const post = await this.postService.findById(parentComment.postId);

    await this.memberInGroupService.isUserInGroup(userId, post.groupId);
    const comments: Array<any> =
      await this.commentPostRepository.getReplyComment(
        parentCommentId,
        filterOptions,
      );

    const totalRecords = await this.commentPostRepository.countBy({
      parentCommentId: parentCommentId,
    });
    const meta = new OffsetPaginationDto(totalRecords, filterOptions);

    return new OffsetPaginatedDto(
      plainToInstance(InfoCommentPostResDto, comments, {
        excludeExtraneousValues: true,
      }),
      meta,
    );
  }

  private async pushNotificationComment(
    userId: Uuid,
    post: PostEntity,
    commentPost: CommentPostEntity,
    dto: CommentPostReqDto,
  ) {
    if (dto.parentCommentId === undefined || dto.parentCommentId === null) {
      if (userId !== post.memberId) {
        const notificationDto = new CreateNotificationDto();
        notificationDto.content = `commented to your post.`;
        notificationDto.objectId = commentPost.id;
        notificationDto.notificationType = NotificationType.COMMENT;
        notificationDto.agentId = userId;
        notificationDto.receiverId = post.memberId;
        notificationDto.targetId = post.groupId;
        notificationDto.targetType = TargetType.GROUP;
        notificationDto.description = commentPost.content;

        await this.pushNotificationService.pushNotificationToUser(
          notificationDto,
          post.memberId,
        );
      }
    } else {
      const parentComment = await this.findById(dto.parentCommentId);
      if (parentComment.memberId !== userId) {
        const notificationDto = new CreateNotificationDto();
        notificationDto.content = `replied to your post.`;
        notificationDto.objectId = commentPost.id;
        notificationDto.notificationType = NotificationType.COMMENT;
        notificationDto.agentId = userId;
        notificationDto.receiverId = parentComment.memberId;
        notificationDto.targetId = post.groupId;
        notificationDto.targetType = TargetType.GROUP;
        notificationDto.description = commentPost.content;

        await this.pushNotificationService.pushNotificationToUser(
          notificationDto,
          parentComment.memberId,
        );
      }
    }
  }
}
