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
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly reactPostRepository: ReactPostRepository,
    private readonly memberInGroupService: MemberInGroupService,
  ) {}

  async createPost(userId: Uuid, groupId: Uuid, dto: CreatePostReqDto) {
    const isUserInGroup = await this.memberInGroupService.isUserInGroup(
      userId,
      groupId,
    );

    if (!isUserInGroup) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }

    const post = new PostEntity({
      ...dto,
      memberId: userId,
      groupId: groupId,
      quizzflyId: dto.quizzflyId,
    });
    await this.postRepository.save(post);

    return post.toDto(InfoPostResDto);
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
    const isUserInGroup = await this.memberInGroupService.isUserInGroup(
      userId,
      groupId,
    );

    if (!isUserInGroup) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }

    const post = await this.findById(postId);
    return post.toDto(InfoPostResDto);
  }

  async deletePost(postId: Uuid, userId: Uuid) {
    const post = await this.findById(postId);

    if (post.memberId !== userId) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }
    await this.postRepository.softDelete({ id: postId });
  }

  async updatePost(postId: Uuid, userId: Uuid, dto: CreatePostReqDto) {
    const post = await this.findById(postId);

    if (post.memberId !== userId) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }

    Object.assign(post, dto);
    await this.postRepository.save(post);
    return post.toDto(InfoPostResDto);
  }

  async getListPost(
    groupId: Uuid,
    userId: Uuid,
    filterOptions: PageOptionsDto,
  ) {
    const isUserInGroup = await this.memberInGroupService.isUserInGroup(
      userId,
      groupId,
    );

    if (!isUserInGroup) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }

    const posts = await this.postRepository.getListPost(groupId, filterOptions);

    const totalRecords = await this.postRepository.countBy({
      groupId: groupId,
    });
    const meta = new OffsetPaginationDto(
      totalRecords,
      filterOptions as PageOptionsDto,
    );

    return new OffsetPaginatedDto(posts, meta);
  }

  async reactPost(userId: Uuid, postId: Uuid) {
    const post = await this.findById(postId);
    const isUserInGroup = await this.memberInGroupService.isUserInGroup(
      userId,
      post.groupId,
    );

    if (!isUserInGroup) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }

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
    }
  }
}
