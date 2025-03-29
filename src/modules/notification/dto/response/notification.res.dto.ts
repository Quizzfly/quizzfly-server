import { BaseResDto } from '@common/dto/base.res.dto';
import { Uuid } from '@common/types/common.type';
import {
  BooleanField,
  ClassFieldOptional,
  EnumField,
  StringField,
  UUIDField,
} from '@core/decorators/field.decorators';
import { NotificationType } from '@modules/notification/enums/notification-type.enum';
import { TargetType } from '@modules/notification/enums/target-type.enum';
import { UserInfoResDto } from '@modules/user/dto/response/user-info.res.dto';
import { Expose, Transform } from 'class-transformer';

@Expose({ toPlainOnly: true })
export class NotificationResDto extends BaseResDto {
  @UUIDField()
  @Expose()
  targetId: Uuid;

  @EnumField(() => TargetType, {
    name: 'target_type',
    example: Object.values(TargetType).join(' | '),
  })
  @Expose()
  targetType: TargetType;

  @StringField()
  @Expose()
  content: string;

  @StringField()
  @Expose()
  description: string;

  @EnumField(() => NotificationType, {
    name: 'notification_type',
    example: Object.values(NotificationType).join(' | '),
  })
  @Expose()
  notificationType: NotificationType;

  @BooleanField()
  @Expose()
  isRead: boolean;

  @ClassFieldOptional(() => UserInfoResDto)
  @Transform(({ obj }) => {
    const { agent, memberId, username, avatar, name } = obj;

    if (agent?.userInfo) {
      const { id } = agent;
      const { username, avatar, name } = agent.userInfo;
      return { id, username, avatar, name };
    }

    return memberId ? { id: memberId, username, avatar, name } : null;
  })
  @Expose()
  agent: UserInfoResDto;

  @UUIDField()
  @Expose()
  @Transform(({ obj }) => {
    if (obj.notificationType === NotificationType.COMMENT) {
      return {
        id: obj?.object?.id,
        content: obj?.object?.content,
        createdAt: obj?.object?.createdAt,
        updatedAt: obj?.object?.updatedAt,
        postId: obj?.object?.postId,
        parentCommentId: obj?.object?.parentCommentId,
        files: obj?.object?.files,
      };
    }

    if (obj.notificationType === NotificationType.POST) {
      return {
        id: obj?.object?.id,
        type: obj?.object?.type,
        content: obj?.object?.content,
        groupId: obj?.object?.groupId,
        quizzflyId: obj?.object?.quizzflyId,
        createdAt: obj?.object?.createdAt,
        updatedAt: obj?.object?.updatedAt,
        files: obj?.object?.files,
      };
    }

    return obj ? { id: obj.id } : null;
  })
  object: object;
}
