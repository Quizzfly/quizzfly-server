import { CreateNotificationDto } from '@/modules/notification/dto/request/create-notification.dto';
import { NotificationType } from '@/modules/notification/enums/notification-type.enum';
import { OffsetPaginationDto } from '@common/dto/offset-pagination/offset-pagination.dto';
import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@common/types/common.type';
import { ErrorCode } from '@core/constants/error-code/error-code.constant';
import { Optional } from '@core/utils/optional';
import { CreatePostReqDto } from '@modules/group/dto/request/create-post.req.dto';
import { InfoPostResDto } from '@modules/group/dto/response/info-post.res.dto';
import { PostEntity } from '@modules/group/entity/post.entity';
import { ReactPostEntity } from '@modules/group/entity/react-post.entity';
import { PostRepository } from '@modules/group/repository/post.repository';
import { ReactPostRepository } from '@modules/group/repository/react-post.repository';
import { MemberInGroupService } from '@modules/group/service/member-in-group.service';
import { GroupEvent } from '@modules/group/socket/enums/group-event.enum';
import { GroupSocketGateway } from '@modules/group/socket/group-socket.gateway';
import { PushNotificationService } from '@modules/notification/service/push-notification.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly reactPostRepository: ReactPostRepository,
    private readonly memberInGroupService: MemberInGroupService,
    private readonly groupSocketGateway: GroupSocketGateway,
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  async createPost(userId: Uuid, groupId: Uuid, dto: CreatePostReqDto) {
    await this.memberInGroupService.isUserInGroup(userId, groupId);

    const post = new PostEntity({
      ...dto,
      memberId: userId,
      groupId: groupId,
      quizzflyId: dto.quizzflyId,
    });
    await this.postRepository.save(post);

    const savedPost = await this.findById(post.id);
    const response = savedPost.toDto(InfoPostResDto);

    this.groupSocketGateway.sendToGroup(
      groupId,
      GroupEvent.CREATE_POST,
      response,
    );

    const groupMembers =
      await this.memberInGroupService.getMemberInGroup(groupId);

    for (const member of groupMembers) {
      if (member.id !== userId) {
        await this.pushNotificationService.pushNotificationToUser(
          {
            content: `A new post has been created in your group.`,
            objectId: post.id,
            notificationType: NotificationType.POST,
            agentId: userId,
            receiverId: member.id,
          },
          member.id,
        );
      }
    }
    return response;
  }

  async findById(id: Uuid) {
    return Optional.of(
      await this.postRepository.findOne({
        where: { id },
      }),
    )
      .throwIfNotPresent(new NotFoundException(ErrorCode.POST_NOT_FOUND))
      .get();
  }

  async getInfoDetailPost(groupId: Uuid, postId: Uuid, userId: Uuid) {
    await this.memberInGroupService.isUserInGroup(userId, groupId);

    const post = await this.postRepository.getDetailPost(postId);
    return plainToInstance(InfoPostResDto, post, {
      excludeExtraneousValues: true,
    });
  }

  async deletePost(postId: Uuid, userId: Uuid) {
    const post = await this.findById(postId);

    if (post.memberId !== userId) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }
    await this.postRepository.softDelete({ id: postId });
    this.groupSocketGateway.sendToGroup(
      post.groupId,
      GroupEvent.DELETE_POST,
      post,
    );
  }

  async updatePost(postId: Uuid, userId: Uuid, dto: CreatePostReqDto) {
    const post = await this.findById(postId);

    if (post.memberId !== userId) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }

    Object.assign(post, dto);
    await this.postRepository.save(post);

    const savedPost = await this.findById(post.id);
    const response = savedPost.toDto(InfoPostResDto);

    this.groupSocketGateway.sendToGroup(
      savedPost.groupId,
      GroupEvent.UPDATE_POST,
      response,
    );
    return response;
  }

  async getListPost(
    groupId: Uuid,
    userId: Uuid,
    filterOptions: PageOptionsDto,
  ) {
    await this.memberInGroupService.isUserInGroup(userId, groupId);

    const posts: Array<any> = await this.postRepository.getListPost(
      groupId,
      filterOptions,
    );

    const totalRecords = await this.postRepository.countBy({
      groupId: groupId,
    });
    const meta = new OffsetPaginationDto(totalRecords, filterOptions);
    return new OffsetPaginatedDto(
      plainToInstance(InfoPostResDto, posts, { excludeExtraneousValues: true }),
      meta,
    );
  }

  async reactPost(userId: Uuid, postId: Uuid) {
    const post = await this.findById(postId);
    await this.memberInGroupService.isUserInGroup(userId, post.groupId);

    if (
      await this.reactPostRepository.existsBy({
        memberId: userId,
        postId: postId,
      })
    ) {
      const reactPost = await this.reactPostRepository.findOneBy({
        memberId: userId,
        postId: postId,
      });

      await this.reactPostRepository.softDelete({ id: reactPost.id });
    } else {
      const reactPost = new ReactPostEntity({
        memberId: userId,
        postId: postId,
      });
      await this.reactPostRepository.save(reactPost);

      this.groupSocketGateway.sendToGroup(
        post.groupId,
        GroupEvent.REACT_POST,
        post.toDto(InfoPostResDto),
      );

      if (userId !== post.memberId) {
        const notificationDto = new CreateNotificationDto();
        notificationDto.content = `${userId} reacted to your post.`;
        notificationDto.objectId = post.id;
        notificationDto.notificationType = NotificationType.POST;
        notificationDto.agentId = userId;
        notificationDto.receiverId = post.memberId;

        await this.pushNotificationService.pushNotificationToUser(
          notificationDto,
          post.memberId,
        );
      }
    }
  }
}
