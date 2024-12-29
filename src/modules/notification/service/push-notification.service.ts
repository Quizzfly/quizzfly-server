import { NotificationService } from '@/modules/notification/service/notification.service';
import { Uuid } from '@common/types/common.type';
import { CreateNotificationDto } from '@modules/notification/dto/request/create-notification.dto';
import { NotificationEvent } from '@modules/notification/socket/enums/notification-event.enum';
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

    const savedNotification =
      await this.notificationService.convertToNotificationResponse(
        notification.id,
      );
    this.notificationSocketGateway.pushNotificationToUser(
      userId,
      savedNotification,
      NotificationEvent.NOTIFICATION,
    );
  }

  async pushNotifcationToUsers(items: CreateNotificationDto[]) {
    const notifications =
      await this.notificationService.createNotifications(items);

    for (const notification of notifications) {
      const savedNotification =
        await this.notificationService.convertToNotificationResponse(
          notification.id,
        );
      this.notificationSocketGateway.pushNotificationToUser(
        notification.receiverId,
        savedNotification,
        NotificationEvent.NOTIFICATION,
      );
    }
  }
}
