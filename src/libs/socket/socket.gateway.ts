import { Uuid } from '@common/types/common.type';
import { EventService } from '@core/events/event.service';
import { WsExceptionFilter } from '@core/filters/ws-exception.filter';
import { RoleInRoom } from '@libs/socket/enums/role-in-room.enum';
import { RoomModel } from '@libs/socket/model/room.model';
import { UserModel } from '@libs/socket/model/user.model';
import { CreateRoomMessageReqDto } from '@libs/socket/payload/request/create-room.req';
import { JoinRoomReqDto } from '@libs/socket/payload/request/join-room.req';
import { StartQuizReqDto } from '@libs/socket/payload/request/start-quiz.req.dto';
import { GetQuestionsEvent } from '@modules/quizzfly/events/quizzfly.event';
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
  private users: Record<string, UserModel> = {};

  constructor(private readonly eventService: EventService) {}

  afterInit(server: Server) {
    this.logger.log(server);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Connected ${client.id}`);
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(
    @MessageBody() message: CreateRoomMessageReqDto,
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.rooms[message.roomPin]) {
      this.rooms[message.roomPin] = {
        players: new Set(),
        locked: false,
        roomPin: message.roomPin,
      };
      this.logger.log(`Room created with pin: ${message.roomPin}`);
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
        this.logger.log(
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
        this.logger.log(`Client ${client.id} joined room ${message.roomPin}`);
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
      this.logger.log(`Client ${client.id} leaved room ${roomPin}`);
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
  async handleStartQuiz(
    @MessageBody() data: StartQuizReqDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomPin, hostId, quizzflyId } = data;
    const user = this.users[client.id];
    const room = this.rooms[roomPin];
    if (!room) {
      throw new WsException('Room not found');
    }

    if (user && user.role === RoleInRoom.HOST) {
      const questions = await this.eventService.emitAsync(
        new GetQuestionsEvent({
          userId: hostId as Uuid,
          quizzflyId: quizzflyId as Uuid,
        }),
      );
      room.questions = {};
      questions.forEach((question: any) => {
        if (!room.questions[question.prevElementId]) {
          room.questions[question.prevElementId] = question;
        }
      });

      room.startTime = Date.now();
      room.currentQuestion = questions[0];
      room.currentQuestionId = room.currentQuestion.id;

      this.server.to(roomPin).emit('quizStarted', {
        roomPin,
        startTime: room.startTime,
        question: room.currentQuestion,
        questions,
      });
      this.logger.log(`Quiz started in room: ${roomPin}`);
    } else {
      throw new WsException('Only the host can start the quiz.');
    }
  }

  @SubscribeMessage('nextQuestion')
  handleNextQuestion(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomPin: string },
  ) {
    const user = this.users[client.id];
    const room = this.rooms[payload.roomPin];
    if (!room) {
      throw new WsException('Room not found');
    }

    if (user && user.role === RoleInRoom.HOST) {
      if (!room.startTime) {
        throw new WsException('Quiz has not started');
      }

      room.currentQuestion.done = true;
      const question = room.questions[room.currentQuestionId];
      if (!question) {
        room.endTime = Date.now();
        throw new WsException('The quiz has run out of questions.');
      }
      room.currentQuestion = question;
      room.currentQuestionId = question.id;

      this.server.to(payload.roomPin).emit('nextQuestion', {
        roomPin: payload.roomPin,
        startTime: Date.now(),
        question: question,
      });
    } else {
      throw new WsException('Only the host can get next question.');
    }
  }
}
