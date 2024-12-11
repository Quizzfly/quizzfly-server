import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { Uuid } from '@common/types/common.type';
import { convertSnakeToCamel } from '@core/helpers';
import { NotificationEntity } from '@modules/notification/entity/notification.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class NotificationRepository extends Repository<NotificationEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(NotificationEntity, dataSource.createEntityManager());
  }

  async getListNotification(userId: Uuid, filterOptions: PageOptionsDto) {
    const skip = filterOptions.page
      ? (filterOptions.page - 1) * filterOptions.limit
      : 0;

    const query = this.createQueryBuilder('notification')
      .leftJoinAndSelect('notification.agent', 'member')
      .leftJoinAndSelect('member.userInfo', 'memberInfo')
      .select([
        'notification.id as id',
        'notification.createdAt as created_at',
        'notification.content as content',
        'notification.objectId as object_id',
        'notification.notificationType as notification_type',
        'notification.isRead as is_read',
        'memberInfo.username as username',
        'memberInfo.avatar as avatar',
        'memberInfo.name as name',
        'member.id as member_id',
      ])
      .where('notification.receiverId = :userId', { userId })
      .andWhere('notification.deletedAt IS NULL')
      .orderBy('notification.createdAt', filterOptions.order)
      .offset(skip)
      .limit(filterOptions.limit);

    return convertSnakeToCamel(await query.getRawMany());
  }
}
