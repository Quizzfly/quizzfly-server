import { Uuid } from '@common/types/common.type';
import { EventService } from '@core/events/event.service';
import { WsExceptionFilter } from '@core/filters/ws-exception.filter';
import { convertCamelToSnake } from '@core/helpers';
import { WsResponseInterceptor } from '@core/interceptors/ws-response.interceptor';
import { Optional } from '@core/utils/optional';
import { RoleInRoom } from '@libs/socket/enums/role-in-room.enum';
import { RoomModel } from '@libs/socket/model/room.model';
import { UserModel } from '@libs/socket/model/user.model';
import { CreateRoomMessageReqDto } from '@libs/socket/payload/request/create-room.req';
import { JoinRoomReqDto } from '@libs/socket/payload/request/join-room.req';
import { KickPlayerReqDto } from '@libs/socket/payload/request/kick-player.req';
import { StartQuizReqDto } from '@libs/socket/payload/request/start-quiz.req.dto';
import { CalculateScoreUtil } from '@libs/socket/utils/calculate-score.util';
import { AnswerEntity } from '@modules/answer/entities/answer.entity';
import { GetQuestionsEvent } from '@modules/quizzfly/events/quizzfly.event';
import { Logger, UseFilters, UseInterceptors } from '@nestjs/common';
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
  private clients: Map<string, Socket> = new Map();

  constructor(private readonly eventService: EventService) {}

  afterInit(server: Server) {
    this.logger.log(server);
  }

  handleDisconnect(client: Socket) {
    // const user = this.users[client.id];
    // if (!user) {
    //   this.logger.log(`Disconnected: ${client.id}`);
    //   return;
    // }
    //
    // if (user.role === RoleInRoom.HOST) {
    //   this.server.to(user.roomPin).emit(
    //     'disconnectAll',
    //     convertCamelToSnake({
    //       disconnectRoom: true,
    //     }),
    //   );
    //   this.server.in(user.roomPin).socketsLeave(user.roomPin);
    // } else {
    //   const host = this.rooms[user.roomPin].host;
    //   const socketClient = this.clients.get(client.id);
    //   this.server.to(host.socketId).emit(
    //     'disconnect',
    //     convertCamelToSnake({
    //       disconnectRoom: true,
    //       player: user,
    //     }),
    //   );
    //   socketClient.leave(user.roomPin);
    // }
    // this.clients.delete(client.id);
    this.logger.log(`Disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Connected ${client.id}`);
  }

  @UseInterceptors(new WsResponseInterceptor())
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
        host: {
          roomPin: message.roomPin,
          socketId: client.id,
          userId: message.userId,
          name: message.name,
          role: RoleInRoom.HOST,
        },
      };
      this.logger.log(`Room created with pin: ${message.roomPin}`);
    }

    this.users[client.id] = {
      socketId: client.id,
      userId: message.userId,
      roomPin: message.roomPin,
      name: message.name,
      role: RoleInRoom.HOST,
    };

    const room = this.rooms[message.roomPin];
    room.players.add(client.id);
    client.join(message.roomPin);
    client.emit(
      'roomCreated',
      convertCamelToSnake({ ...room, players: undefined }),
    );
    return room;
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() message: JoinRoomReqDto,
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.rooms[message.roomPin];
    if (room) {
      if (room.locked) {
        this.logger.log(
          `User ${client.id} attempted to join a locked room: ${message.roomPin}`,
        );
        throw new WsException('Room is locked');
      } else {
        room.players.add(client.id);
        this.users[client.id] = {
          socketId: client.id,
          userId: message.userId,
          name: message.name,
          roomPin: message.roomPin,
          role: RoleInRoom.PLAYER,
          answers: {},
          totalScore: 0,
        };
        this.clients.set(client.id, client);
        client.join(message.roomPin);

        const player = this.users[client.id];
        this.logger.log(
          `Player [${player.socketId} - ${player.userId} - ${player.name}] joined room ${message.roomPin}`,
        );

        this.server.to(message.roomPin).emit(
          'playerJoined',
          convertCamelToSnake({
            newPlayer: player,
            totalPlayer: room.players.size - 1,
          }),
        );
      }
    } else {
      throw new WsException('Room not found');
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() roomPin: string,
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.rooms[roomPin];

    if (room) {
      room.players.delete(client.id);
      client.leave(roomPin);

      const player = this.users[client.id];
      if (!player) {
        throw new WsException('Player not found');
      }
      this.logger.log(
        `Player [${player.socketId} - ${player.userId} - ${player.name}] leaved room ${roomPin}`,
      );

      this.server.to(roomPin).emit(
        'playerLeft',
        convertCamelToSnake({
          playerLeft: player,
          totalPlayer: room.players.size - 1,
        }),
      );
      this.users[client.id] = undefined;
      this.clients.delete(client.id);
    } else {
      throw new WsException('Room not found');
    }
  }

  @SubscribeMessage('kickPlayer')
  handleKickPlayerInRoom(
    @MessageBody() payload: KickPlayerReqDto,
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.rooms[payload.roomPin];
    if (room === null) {
      throw new WsException('Room not found');
    }
    const user = this.users[client.id];
    if (user.role !== RoleInRoom.HOST) {
      throw new WsException('Only the host can kick player in room');
    }

    const socket = this.clients.get(payload.socketId);
    if (socket) {
      const player = this.users[payload.socketId];
      if (!player) {
        throw new WsException('Player not found');
      }

      socket.leave(payload.roomPin);
      room.players.delete(payload.socketId);

      this.server.to(payload.roomPin).emit(
        'kickPlayer',
        convertCamelToSnake({
          playerLeft: player,
          totalPlayer: room.players.size - 1,
        }),
      );

      delete this.users[payload.socketId];
      this.clients.delete(client.id);
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
        this.server
          .to(message.roomPin)
          .emit('roomLocked', convertCamelToSnake({ locked: true }));
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
      if (room.startTime) {
        throw new WsException('Quiz has been started');
      }
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
      room.currentQuestion.startTime = Date.now();
      room.currentQuestionId = room.currentQuestion.id;
      const question = room.currentQuestion;
      if (question.type === 'QUIZ') {
        question.choices = {};
        question?.answers.forEach((answer: AnswerEntity) => {
          question.choices[answer.id] = 0;
          if (answer.isCorrect) {
            question.correctAnswerId = answer.id;
          }
        });
      }

      this.server.to(roomPin).emit(
        'quizStarted',
        convertCamelToSnake({
          roomPin,
          startTime: room.startTime,
          question: room.currentQuestion,
          questions,
        }),
      );
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
      room.currentQuestion.startTime = Date.now();
      room.currentQuestionId = question.id;

      if (room.currentQuestion.type === 'QUIZ') {
        room.currentQuestion.choices = {};
        room.currentQuestion.answers.forEach((answer: AnswerEntity) => {
          room.currentQuestion.choices[answer.id] = 0;
          if (answer.isCorrect) {
            room.currentQuestion.correctAnswerId = answer.id;
          }
        });
      }

      this.server.to(payload.roomPin).emit(
        'nextQuestion',
        convertCamelToSnake({
          roomPin: payload.roomPin,
          startTime: Date.now(),
          question: question,
        }),
      );
    } else {
      throw new WsException('Only the host can get next question.');
    }
  }

  @SubscribeMessage('answerQuestion')
  handleAnswerQuestion(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { roomPin: string; questionId: string; answerId: string },
  ) {
    const room = Optional.of(this.rooms[payload.roomPin])
      .throwIfNotPresent(new WsException('Room not found'))
      .get();

    const player: UserModel = Optional.of(this.users[client.id])
      .throwIfNotPresent(new WsException('Player invalid'))
      .get();
    const question = room.currentQuestion;
    if (question.type !== 'QUIZ') {
      throw new WsException('Not allowed');
    }

    if (!question.choices[payload.answerId]) {
      question.choices[payload.answerId] = 1;
    } else {
      question.choices[payload.answerId] += 1;
    }

    const calculateScore = new CalculateScoreUtil({
      baseScore: 100,
      startTime: question.startTime,
      timeLimit: question.timeLimit,
      responseTime: Date.now(),
      isCorrect: payload.answerId === question.correctAnswerId,
      pointMultiplier: question.pointMultiplier,
    });
    const score = calculateScore.score;

    if (!player.answers[payload.questionId]) {
      player.answers[payload.questionId] = {
        questionId: payload.questionId,
        chosenAnswerId: payload.answerId,
        isCorrect: question.correctAnswerId === payload.answerId,
        score,
      };
    }

    player.totalScore = player.totalScore ? player.totalScore + score : score;
    client.emit('answerQuestion', { message: 'Waiting...' });
  }

  @SubscribeMessage('finishQuestion')
  handleQuestionFinish(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomPin: string;
      questionId: string;
    },
  ) {
    const room: RoomModel = Optional.of(this.rooms[payload.roomPin])
      .throwIfNotPresent(new WsException('Room not found'))
      .get();
    const user = this.users[client.id];
    if (!user || user.role !== RoleInRoom.HOST) {
      throw new WsException(
        'Only the room owner is allowed to perform this action.',
      );
    }

    Array.from(room.players).forEach((playerId: string) => {
      const player = this.users[playerId];
      const client = this.clients.get(playerId);
      if (player && client && player.role === RoleInRoom.PLAYER) {
        client.emit(
          'resultAnswer',
          convertCamelToSnake({
            roomPin: payload.roomPin,
            score: player.answers[payload.questionId].score,
            totalScore: player.totalScore,
            correct: player.answers[payload.questionId].isCorrect,
            questionId: payload.questionId,
            correctAnswerId: room.currentQuestion.correctAnswerId,
            chosenAnswerId: player.answers[payload.questionId].chosenAnswerId,
          }),
        );
      }
    });

    client.emit(
      'summaryAnswer',
      convertCamelToSnake({
        roomPin: payload.roomPin,
        questionId: payload.questionId,
        correctAnswerId: room.currentQuestion.correctAnswerId,
        answersCount: room.currentQuestion.choices,
      }),
    );
  }
}
