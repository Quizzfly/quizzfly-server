import { Uuid } from '@common/types/common.type';
import {
  NumberField,
  StringField,
  UUIDField,
} from '@core/decorators/field.decorators';
import { NotificationType } from '@modules/notification/enums/notification-type.enum';

export class CreateNotificationDto {
  @StringField({ name: 'content' })
  content: string;

  @UUIDField({ name: 'object_id' })
  objectId: Uuid;

  @StringField({ name: 'notification_type' })
  notificationType: NotificationType;

  @UUIDField({ name: 'agent_id' })
  agentId: Uuid;

  @NumberField({ name: 'receiver_id' })
  receiverId: Uuid;
}
