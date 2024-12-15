import { Uuid } from '@common/types/common.type';
import { IEvent } from '@core/events/event.interface';

export const CommentScope = 'comment';

export enum CommentAction {
  getCommentEntity = 'get-comment-entity',
}

export class GetCommentEntityEvent implements IEvent<Uuid> {
  readonly scope = CommentScope;
  readonly name = CommentAction.getCommentEntity;

  constructor(readonly payload: Uuid) {}
}

export const PostScope = 'post';

export enum PostAction {
  getPostEntity = 'get-post-entity',
}

export class GetPostEntityEvent implements IEvent<Uuid> {
  readonly scope = PostScope;
  readonly name = PostAction.getPostEntity;

  constructor(readonly payload: Uuid) {}
}
