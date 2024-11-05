import { RoleInRoom } from '@libs/socket/enums/role-in-room.enum';
import { RoomSocket } from '@libs/socket/model/room-socket';
import { UserInSocket } from '@libs/socket/model/user-in-socket';
import { CreateRoomMessageReqDto } from '@libs/socket/payload/request/create-room.req';
import { JoinRoomReqDto } from '@libs/socket/payload/request/join-room.req';
import { Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(SocketGateway.name);

  private rooms: Record<string, RoomSocket> = {};

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
      this.rooms[message.roomPin] = { players: new Set(), locked: false };
      console.log(`Room created with pin: ${message.roomPin}`);
    }
    this.users[client.id] = {
      socketId: client.id,
      userId: message.userId,
      name: message.name,
      role: RoleInRoom.HOST,
    };
    this.rooms[message.roomPin].players.add(client.id);
    client.join(message.roomPin);
    this.server
      .to(message.roomPin)
      .emit('roomMembersJoin', this.users[client.id]);
  }

  getRoomMembersCount(roomPin: string): number {
    return this.rooms[roomPin] ? this.rooms[roomPin].players.size : 0;
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() message: JoinRoomReqDto,
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.rooms[message.roomPin];
    if (room) {
      if (room.locked) {
        client.emit('roomJoinError', { message: 'Room is locked' });
        console.log(
          `User ${client.id} attempted to join a locked room: ${message.roomPin}`,
        );
      } else {
        this.rooms[message.roomPin].players.add(client.id);
        this.users[client.id] = {
          socketId: client.id,
          name: message.name,
          role: RoleInRoom.PLAYER,
        };
        client.join(message.roomPin);
        console.log(`Client ${client.id} joined room ${message.roomPin}`);
        this.server
          .to(message.roomPin)
          .emit('roomMembersJoin', this.users[client.id]);
        this.server.to(message.roomPin).emit('roomMembersCount', {
          count: this.getRoomMembersCount(message.roomPin),
        });
      }
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
      this.rooms[roomPin].players.delete(client.id);
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

  @SubscribeMessage('lockRoom')
  handleLockRoom(
    @MessageBody() message: { roomPin: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.rooms[message.roomPin];
    if (room && this.users[client.id].role === RoleInRoom.HOST) {
      room.locked = true;
      this.server.to(message.roomPin).emit('roomLocked', { locked: true });
      console.log(`Room with pin: ${message.roomPin} is now locked`);
    }
  }

  @SubscribeMessage('unlockRoom')
  handleUnlockRoom(
    @MessageBody() message: { roomPin: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.rooms[message.roomPin];
    if (room && this.users[client.id].role === RoleInRoom.HOST) {
      room.locked = false;
      this.server.to(message.roomPin).emit('roomLocked', { locked: false });
      console.log(`Room with pin: ${message.roomPin} is now unlocked`);
    }
  }
}
