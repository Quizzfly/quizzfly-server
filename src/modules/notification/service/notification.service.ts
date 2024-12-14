import { OffsetPaginationDto } from '@common/dto/offset-pagination/offset-pagination.dto';
import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@common/types/common.type';
import { ErrorCode } from '@core/constants/error-code/error-code.constant';
import { Optional } from '@core/utils/optional';
import { CreateNotificationDto } from '@modules/notification/dto/request/create-notification.dto';
import { NotificationResDto } from '@modules/notification/dto/response/notification.res.dto';
import { NotificationRepository } from '@modules/notification/repository/notification.repository';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { NotificationEntity } from '../entity/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async createNotification(data: CreateNotificationDto) {
    const notification = new NotificationEntity({
      content: data.content,
      description: data.description,
      objectId: data.objectId,
      targetId: data.targetId,
      targetType: data.targetType,
      notificationType: data.notificationType,
      agentId: data.agentId,
      receiverId: data.receiverId,
    });

    await this.notificationRepository.save(notification);
    return notification;
  }

  async createNotifications(items: CreateNotificationDto[]) {
    const notifications = await this.notificationRepository.save(
      items as NotificationEntity[],
    );
    return notifications;
  }

  async findById(id: Uuid) {
    return <NotificationEntity>Optional.of(
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
    const notifications: Array<any> =
      await this.notificationRepository.getListNotification(userId, filter);

    const totalRecords = await this.notificationRepository.countBy({
      receiverId: userId,
    });
    const meta = new OffsetPaginationDto(totalRecords, filter);

    return new OffsetPaginatedDto(
      plainToInstance(NotificationResDto, notifications, {
        excludeExtraneousValues: true,
      }),
      meta,
    );
  }
}
