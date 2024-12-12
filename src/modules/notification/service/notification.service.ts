import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { Uuid } from '@common/types/common.type';
import { ErrorCode } from '@core/constants/error-code/error-code.constant';
import { Optional } from '@core/utils/optional';
import { CreateNotificationDto } from '@modules/notification/dto/request/create-notification.dto';
import { NotificationRepository } from '@modules/notification/repository/notification.repository';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationEntity } from '../entity/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async createNotification(data: CreateNotificationDto) {
    const notification = new NotificationEntity({
      content: data.content,
      objectId: data.objectId,
      notificationType: data.notificationType,
      agentId: data.agentId,
      receiverId: data.receiverId,
    });

    await this.notificationRepository.save(notification);
    return notification;
  }

  async findById(id: Uuid) {
    return Optional.of(
      await this.notificationRepository.findOne({
        where: { id },
      }),
    )
      .throwIfNotPresent(
        new NotFoundException(ErrorCode.NOTIFICATION_NOT_FOUND),
      )
      .get();
  }

  async countUnreadNotification(userId: Uuid) {
    return this.notificationRepository.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
  }

  async markReadNotification(notificationId: Uuid, userId: Uuid) {
    const notification = await this.findById(notificationId);

    if (notification.receiverId !== userId) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }

    notification.isRead = true;
    await this.notificationRepository.save(notification);
  }

  async markReadAllNotification(userId: Uuid) {
    await this.notificationRepository.update(
      { receiverId: userId, isRead: false },
      { isRead: true },
    );
  }

  async getListNotification(userId: Uuid, filter: PageOptionsDto) {
    return await this.notificationRepository.getListNotification(
      userId,
      filter,
    );
  }
}
