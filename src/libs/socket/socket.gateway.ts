import { WsExceptionFilter } from '@core/filters/ws-exception.filter';
import { RoleInRoom } from '@libs/socket/enums/role-in-room.enum';
import { RoomModel } from '@libs/socket/model/room.model';
import { UserInSocket } from '@libs/socket/model/user-in-socket';
import { CreateRoomMessageReqDto } from '@libs/socket/payload/request/create-room.req';
import { JoinRoomReqDto } from '@libs/socket/payload/request/join-room.req';
import { StartQuizReqDto } from '@libs/socket/payload/request/start-quiz.req.dto';
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
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@UseFilters(WsExceptionFilter)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/rooms',
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(SocketGateway.name);
  private rooms: Record<string, RoomModel> = {};
  private users: Record<string, UserInSocket> = {};

  constructor() {}

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
    return this.rooms[roomPin] ? this.rooms[roomPin].players.size - 1 : 0;
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
    const host = this.users[client.id];

    if (room) {
      if (host && host.role === RoleInRoom.HOST) {
        room.locked = true;
        this.server.to(message.roomPin).emit('roomLocked', { locked: true });
        this.logger.log(`Room with pin: ${message.roomPin} is now locked`);
      } else {
        throw new WsException('Only the host can lock the room.');
      }
    } else {
      throw new WsException('Room not found');
    }
  }

  @SubscribeMessage('unlockRoom')
  handleUnlockRoom(
    @MessageBody() message: { roomPin: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.rooms[message.roomPin];
    const host = this.users[client.id];

    if (room) {
      if (host && host.role === RoleInRoom.HOST) {
        room.locked = false;
        this.server.to(message.roomPin).emit('roomLocked', { locked: false });
        this.logger.log(`Room with pin: ${message.roomPin} is now unlocked`);
      } else {
        throw new WsException('Only the host can unlock the room.');
      }
    } else {
      throw new WsException('Room not found');
    }
  }

  @SubscribeMessage('startQuiz')
  handleStartQuiz(
    @MessageBody() data: StartQuizReqDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomPin, hostId } = data;
    const user = this.users[client.id];
    const room = this.rooms[data.roomPin];

    if (user && user.role === RoleInRoom.HOST && room) {
      this.server.to(roomPin).emit('quizStarted', {
        message: 'Quiz has started!',
        roomPin: roomPin,
        hostName: user.name,
      });
      this.logger.log(`Quiz started in room: ${roomPin}`);
    } else {
      throw new WsException('Only the host can start the quiz.');
    }
  }
}
