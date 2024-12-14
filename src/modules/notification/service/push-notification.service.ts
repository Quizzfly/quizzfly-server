import { NotificationService } from '@/modules/notification/service/notification.service';
import { Uuid } from '@common/types/common.type';
import { CreateNotificationDto } from '@modules/notification/dto/request/create-notification.dto';
import { NotificationResDto } from '@modules/notification/dto/response/notification.res.dto';
import { NotificationSocketGateway } from '@modules/notification/socket/notification-socket.gateway';
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PushNotificationService {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationSocketGateway: NotificationSocketGateway,
  ) {}

  async pushNotificationToUser(data: CreateNotificationDto, userId: Uuid) {
    const notification =
      await this.notificationService.createNotification(data);

    const savedNotification = await this.notificationService.findById(
      notification.id,
    );
    this.notificationSocketGateway.pushNotificationToUser(
      userId,
      plainToInstance(NotificationResDto, savedNotification, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async pushNotifcationToUsers(items: CreateNotificationDto[]) {
    const notifications =
      await this.notificationService.createNotifications(items);

    for (const notification of notifications) {
      const savedNotification = await this.notificationService.findById(
        notification.id,
      );
      this.notificationSocketGateway.pushNotificationToUser(
        notification.receiverId,
        plainToInstance(NotificationResDto, savedNotification, {
          excludeExtraneousValues: true,
        }),
      );
    }
  }
}
