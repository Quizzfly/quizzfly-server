import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { Uuid } from '@common/types/common.type';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { ApiAuth } from '@core/decorators/http.decorators';
import { NotificationService } from '@modules/notification/service/notification.service';
import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { NotificationResDto } from '../dto/response/notification.res.dto';

@Controller({
  path: 'notifications',
  version: '1',
})
@ApiTags('Notification APIs')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiAuth({
    type: NotificationResDto,
    summary: 'Get list of notifications',
    isPaginated: true,
    paginationType: 'offset',
  })
  @Get()
  async getNotifications(
    @CurrentUser('id') userId: Uuid,
    @Query() filterOptions: PageOptionsDto,
  ) {
    return await this.notificationService.getListNotification(
      userId,
      filterOptions,
    );
  }

  @ApiAuth({
    summary: 'Get list of unread notifications',
  })
  @Get('/unread-count')
  async getUnreadNotifications(@CurrentUser('id') userId: Uuid) {
    return await this.notificationService.countUnreadNotification(userId);
  }

  @ApiAuth({
    summary: 'Mark specific notification as read',
  })
  @ApiParam({
    name: 'notificationId',
    description: 'The UUID of the notification',
    type: 'string',
  })
  @Patch(':notificationId/read')
  async markReadNotification(
    @CurrentUser('id') userId: Uuid,
    @Param('notificationId') notificationId: Uuid,
  ) {
    return await this.notificationService.markReadNotification(
      notificationId,
      userId,
    );
  }

  @ApiAuth({
    summary: 'Mark all notification as read',
  })
  @Patch('/read-all')
  async markReadAllNotification(@CurrentUser('id') userId: Uuid) {
    return await this.notificationService.markReadAllNotification(userId);
  }
}
