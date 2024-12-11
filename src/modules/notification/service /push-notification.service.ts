import { Uuid } from '@common/types/common.type';
import { CreateNotificationDto } from '@modules/notification/dto/request/create-notification.dto';
import { NotificationService } from '@modules/notification/service /notification.service';
import { NotificationSocketGateway } from '@modules/notification/socket/notification-socket.gateway';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PushNotificationService {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationSocketGateway: NotificationSocketGateway,
  ) {}

  async pushNotificationToUser(data: CreateNotificationDto, userId: Uuid) {
    const notification =
      await this.notificationService.createNotification(data);
    this.notificationSocketGateway.pushNotificationToUser(userId, notification);
  }
}
