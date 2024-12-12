import { NotificationController } from '@modules/notification/controller/notification.controller';
import { NotificationEntity } from '@modules/notification/entity/notification.entity';
import { NotificationRepository } from '@modules/notification/repository/notification.repository';
import { NotificationService } from '@modules/notification/service/notification.service';
import { PushNotificationService } from '@modules/notification/service/push-notification.service';
import { NotificationSocketGateway } from '@modules/notification/socket/notification-socket.gateway';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity]), UserModule],
  controllers: [NotificationController],
  providers: [
    NotificationRepository,
    NotificationService,
    PushNotificationService,
    NotificationSocketGateway,
  ],
  exports: [PushNotificationService],
})
export class NotificationModule {}
