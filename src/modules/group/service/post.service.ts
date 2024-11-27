import { OffsetPaginationDto } from '@common/dto/offset-pagination/offset-pagination.dto';
import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@common/types/common.type';
import { ErrorCode } from '@core/constants/error-code/error-code.constant';
import { Optional } from '@core/utils/optional';
import { CommentPostReqDto } from '@modules/group/dto/request/comment-post.req.dto';
import { CreatePostReqDto } from '@modules/group/dto/request/create-post.req.dto';
import { InfoCommentPostResDto } from '@modules/group/dto/response/info-comment-post.res.dto';
import { InfoPostResDto } from '@modules/group/dto/response/info-post.res.dto';
import { CommentPostEntity } from '@modules/group/entity/comment-post.entity';
import { PostEntity } from '@modules/group/entity/post.entity';
import { ReactPostEntity } from '@modules/group/entity/react-post.entity';
import { CommentPostRepository } from '@modules/group/repository/comment-post.repository';
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
    private readonly commentPostRepository: CommentPostRepository,
    private readonly memberInGroupService: MemberInGroupService,
  ) {}

  async createPost(userId: Uuid, groupId: Uuid, dto: CreatePostReqDto) {
    await this.isUserInGroup(userId, groupId);

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
    await this.isUserInGroup(userId, groupId);

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
    await this.isUserInGroup(userId, groupId);

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
    await this.isUserInGroup(userId, post.groupId);

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

  async commentPost(userId: Uuid, postId: Uuid, dto: CommentPostReqDto) {
    const post = await this.findById(postId);
    await this.isUserInGroup(userId, post.groupId);

    const commentPost = new CommentPostEntity({
      ...dto,
      memberId: userId,
      postId: postId,
      parentCommentId: dto.parentCommentId,
    });
    await this.commentPostRepository.save(commentPost);

    return commentPost.toDto(InfoCommentPostResDto);
  }

  async getCommentInPost(
    userId: Uuid,
    postId: Uuid,
    filterOptions: PageOptionsDto,
  ) {
    const post = await this.findById(postId);
    await this.isUserInGroup(userId, post.groupId);

    const comments = await this.commentPostRepository.getCommentInPost(
      postId,
      filterOptions,
    );

    const totalRecords = await this.commentPostRepository.countBy({
      postId: postId,
    });
    const meta = new OffsetPaginationDto(
      totalRecords,
      filterOptions as PageOptionsDto,
    );

    return new OffsetPaginatedDto(comments, meta);
  }

  private async isUserInGroup(userId: Uuid, groupId: Uuid) {
    const isUserInGroup = await this.memberInGroupService.isUserInGroup(
      userId,
      groupId,
    );

    if (!isUserInGroup) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }
  }
}
