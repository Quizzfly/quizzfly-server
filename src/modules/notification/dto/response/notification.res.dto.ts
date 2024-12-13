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
import { UserInfoResDto } from '@modules/user/dto/response/user-info.res.dto';
import { Expose, Transform } from 'class-transformer';

@Expose({ toPlainOnly: true })
export class NotificationResDto extends BaseResDto {
  @UUIDField()
  @Expose()
  objectId: Uuid;

  @StringField()
  @Expose()
  content: Uuid;

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
    const { memberId, username, avatar, name } = obj;

    return memberId ? { id: memberId, username, avatar, name } : null;
  })
  @Expose()
  agent: UserInfoResDto;
}
