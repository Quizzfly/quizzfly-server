import { EventService } from '@core/events/event.service';
import { WsExceptionFilter } from '@core/filters/ws-exception.filter';
import { RegisterGroupReqDto } from '@modules/group/socket/payload/request/register-group.req.dto';
import { Logger, UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@UseFilters(WsExceptionFilter)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/groups',
})
export class GroupSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(GroupSocketGateway.name);

  constructor(private readonly eventService: EventService) {}

  afterInit(server: Server) {
    this.logger.log(server);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Connected ${client.id} group`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Disconnected: ${client.id}`);
  }

  @SubscribeMessage('registerGroup')
  handleRegisterGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: RegisterGroupReqDto,
  ) {
    data.groupIds.forEach((id) => {
      client.join(id);
      this.logger.log(`Client ${client.id} registered to group ${id}`);
    });
  }

  sendToGroup(groupId: string, event: string, data: object) {
    this.server.to(groupId).emit(event, data);
  }
}
