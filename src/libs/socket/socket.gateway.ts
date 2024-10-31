import { UserInSocket } from '@libs/socket/model/user-in-socket';
import { CreateRoomMessageReqDto } from '@libs/socket/payload/request/create-room.req';
import { JoinRoomReqDto } from '@libs/socket/payload/request/join-room.req';
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

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/rooms',
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor() {}

  @WebSocketServer() server: Server;

  private rooms: Record<string, Set<string>> = {};

  private users: Record<string, UserInSocket> = {};

  afterInit(server: Server) {
    console.log(server);
  }

  handleDisconnect(client: Socket) {
    console.log(`Disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Connected ${client.id}`);
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(
    @MessageBody() message: CreateRoomMessageReqDto,
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.rooms[message.roomPin]) {
      this.rooms[message.roomPin] = new Set();
      console.log(`Room created with pin: ${message.roomPin}`);
    }
    this.users[client.id] = {
      socketId: client.id,
      userId: message.userId,
      name: message.name,
      role: 'HOST',
    };
    this.rooms[message.roomPin].add(client.id);
    client.join(message.roomPin);
    this.server
      .to(message.roomPin)
      .emit('roomMembersJoin', this.users[client.id]);
  }

  getRoomMembersCount(roomPin: string): number {
    return this.rooms[roomPin] ? this.rooms[roomPin].size : 0;
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() message: JoinRoomReqDto,
    @ConnectedSocket() client: Socket,
  ) {
    if (this.rooms[message.roomPin]) {
      this.rooms[message.roomPin].add(client.id);
      this.users[client.id] = {
        socketId: client.id,
        name: message.name,
        role: 'MEMBER',
      };
      client.join(message.roomPin);
      console.log(`Client ${client.id} joined room ${message.roomPin}`);
      this.server
        .to(message.roomPin)
        .emit('roomMembersJoin', this.users[client.id]);
      this.server.to(message.roomPin).emit('roomMembersCount', {
        count: this.getRoomMembersCount(message.roomPin),
      });
    } else {
      client.emit('error', 'Room not found');
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() roomPin: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (this.rooms[roomPin]) {
      this.rooms[roomPin].delete(client.id);
      client.leave(roomPin);
      console.log(`Client ${client.id} leaved room ${roomPin}`);
      this.server.to(roomPin).emit('roomMembersLeave', { socketId: client.id });
      this.server
        .to(roomPin)
        .emit('roomMembersCount', { count: this.getRoomMembersCount(roomPin) });
    } else {
      client.emit('error', 'Room not found');
    }
  }
}
