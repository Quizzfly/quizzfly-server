import { Uuid } from '@common/types/common.type';
import { WebsocketExceptionFilter } from '@core/filters/websocket-exception.filter';
import { convertCamelToSnake } from '@core/helpers';
import { NotificationEvent } from '@modules/notification/socket/enums/notification-event.enum';
import { Logger, UseFilters } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@UseFilters(WebsocketExceptionFilter)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
})
export class NotificationSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(NotificationSocketGateway.name);
  private readonly users: Record<Uuid, Socket> = {};

  constructor() {}

  afterInit(server: Server) {
    this.logger.log('Notification gateway has been initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Connected ${client.id} notification`);
    const userId = client.handshake.query.user_id as Uuid;
    this.users[userId] = client;
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Disconnected: ${client.id}`);
  }

  pushNotificationToUser<T>(userId: Uuid, data: T, event: NotificationEvent) {
    const client = this.users[userId];
    if (client) {
      client.emit(event, convertCamelToSnake(data));
      this.logger.log(`Notification sent to user ${userId}`);
    } else {
      this.logger.warn(`User ${userId} is not connected`);
    }
  }
}
