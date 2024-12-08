import { Uuid } from '@common/types/common.type';
import { WebsocketExceptionFilter } from '@core/filters/websocket-exception.filter';
import { convertCamelToSnake } from '@core/helpers';
import { MemberInGroupRepository } from '@modules/group/repository/member-in-group.repository';
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
  namespace: '/groups',
})
export class GroupSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(GroupSocketGateway.name);

  constructor(
    private readonly memberInGroupRepository: MemberInGroupRepository,
  ) {}

  afterInit(server: Server) {
    this.logger.log(server);
  }

  async handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Connected ${client.id} group`);
    const userId = client.handshake.query.user_id as Uuid;
    const memberInGroups = await this.memberInGroupRepository.findBy({
      memberId: userId,
    });

    memberInGroups.forEach((memberInGroups) => {
      client.join(memberInGroups.groupId);
      this.logger.log(
        `Client ${client.id} registered to group ${memberInGroups.groupId}`,
      );
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Disconnected: ${client.id}`);
  }

  sendToGroup<T>(groupId: string, event: string, data: T): void {
    this.server.to(groupId).emit(event, convertCamelToSnake(data));
  }
}
