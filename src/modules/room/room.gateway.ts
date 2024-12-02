import { Uuid } from '@common/types/common.type';
import { CacheKey } from '@core/constants/cache.constant';
import { EventService } from '@core/events/event.service';
import { WebsocketExceptionFilter } from '@core/filters/websocket-exception.filter';
import { convertCamelToSnake, updatePropertiesIfDefined } from '@core/helpers';
import { WsValidationPipe } from '@core/pipes/ws-validation.pipe';
import { Optional } from '@core/utils/optional';
import { CacheTTL } from '@libs/redis/utils/cache-ttl.utils';
import { CreateCacheKey } from '@libs/redis/utils/create-cache-key.utils';
import { AnswerEntity } from '@modules/answer/entities/answer.entity';
import { GetQuestionsEvent } from '@modules/quizzfly/events/quizzfly.event';
import { ParticipantInRoomEntity } from '@modules/room/entities/participant-in-room.entity';
import {
  AnswerInRoom,
  QuestionEntity,
} from '@modules/room/entities/question.entity';
import { RoomEvent } from '@modules/room/enums/room-event.enum';
import { RoomPhase } from '@modules/room/enums/room-phase.enum';
import { updateRank } from '@modules/room/helpers/update-leader-board.helper';
import { ParticipantModel } from '@modules/room/model/participant.model';
import { Question, RoomModel } from '@modules/room/model/room.model';
import { ParticipantDto } from '@modules/room/payload/participant.dto';
import { AnswerQuestionDto } from '@modules/room/payload/request/answer-question.dto';
import { CreateRoomDto } from '@modules/room/payload/request/create-room.dto';
import { FinishQuestionDto } from '@modules/room/payload/request/finish-question.dto';
import { JoinRoomDto } from '@modules/room/payload/request/join-room.dto';
import { KickParticipantDto } from '@modules/room/payload/request/kick-participant.dto';
import { LeaveRoomDto } from '@modules/room/payload/request/leave-room.dto';
import { LockRoomDto } from '@modules/room/payload/request/lock-room.dto';
import { NextQuestionDto } from '@modules/room/payload/request/next-question.dto';
import { SettingRoomDto } from '@modules/room/payload/request/setting-room.dto';
import { StartQuizDto } from '@modules/room/payload/request/start-quiz.dto';
import { UpdateLeaderBoardDto } from '@modules/room/payload/request/update-leader-board.dto';
import { ParticipantAnswerService } from '@modules/room/services/participant-answer.service';
import { ParticipantInRoomService } from '@modules/room/services/participant-in-room.service';
import { QuestionService } from '@modules/room/services/question.service';
import { RoomService } from '@modules/room/services/room.service';
import { CalculateScoreUtil } from '@modules/room/utils/calculate-score.util';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Logger, UseFilters } from '@nestjs/common';
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
import { Cache } from 'cache-manager';
import { Server, Socket } from 'socket.io';

@UseFilters(WebsocketExceptionFilter)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/rooms',
})
export class RoomGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(RoomGateway.name);
  private rooms: Record<string, RoomModel> = {};
  private participants: Record<string, ParticipantModel> = {};
  private clients: Map<string, Socket> = new Map();

  constructor(
    private readonly eventService: EventService,
    private readonly roomService: RoomService,
    private readonly participantInRoomService: ParticipantInRoomService,
    private readonly questionService: QuestionService,
    private readonly participantAnswerService: ParticipantAnswerService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
  ) {}

  afterInit(server: Server) {
    this.logger.log(server);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Connected ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    const { roomPin, userId } = client.data;
    this.logger.log(`Disconnected: ${client.id}`);
    if (!roomPin) {
      return;
    }

    const room = this.rooms[roomPin];
    if (!room) {
      return;
    }

    if (this.isHostInRoom(userId, client.id, room)) {
      this.handleHostDisconnect(room);
    } else {
      const participant = this.participants[client.data.participantId];
      if (!participant) {
        return;
      }
      await this.handleParticipantDisconnect(participant, room);
    }
  }

  @SubscribeMessage(RoomEvent.CREATE_ROOM)
  handleCreateRoom(
    @MessageBody(new WsValidationPipe()) payload: CreateRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    if (this.rooms[payload.roomPin]) {
      throw new WsException(
        'The room PIN you entered already exists. Please choose a different one.',
      );
    }

    this.rooms[payload.roomPin] = {
      roomId: payload.roomId,
      roomPin: payload.roomPin,
      participants: new Set(),
      locked: false,
      isAutoPlay: true,
      isShowQuestion: false,
      host: {
        socketId: client.id,
        userId: payload.userId,
        name: payload.name,
      },
    };
    this.logger.log(`Room created with pin: ${payload.roomPin}.`);

    this.clients.set(payload.userId, client);

    const room = this.rooms[payload.roomPin];
    client.join(payload.roomPin);
    client.emit(
      RoomEvent.ROOM_CREATED,
      convertCamelToSnake({ ...room, participants: undefined }),
    );
    client.data.roomPin = payload.roomPin;
    client.data.userId = payload.userId;
  }

  @SubscribeMessage(RoomEvent.JOIN_ROOM)
  async handleJoinRoom(
    @MessageBody(new WsValidationPipe()) payload: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.rooms[payload.roomPin];
    if (!room) {
      throw new WsException('Room not found.');
    }

    if (room.locked) {
      this.logger.log(
        `User with socketId ${client.id} attempted to join a locked room: ${payload.roomPin}.`,
      );
      throw new WsException('Room is locked.');
    }

    const newParticipant = await this.participantInRoomService.joinRoom({
      socketId: client.id,
      userId: payload.userId,
      nickName: payload.nickName,
      roomId: room.roomId,
      roomPin: payload.roomPin,
    });

    room.participants.add(newParticipant.id);
    this.participants[newParticipant.id] = {
      id: newParticipant.id,
      socketId: client.id,
      userId: payload.userId,
      nickName: payload.nickName,
      roomPin: payload.roomPin,
      answers: {},
      totalScore: 0,
      timeJoin: new Date(),
    };
    this.clients.set(newParticipant.id, client);
    client.join(payload.roomPin);

    const participant = this.participants[newParticipant.id];
    this.logger.log(
      `Participant [${participant.socketId} - ${participant.userId} - ${participant.nickName}] joined room ${payload.roomPin}.`,
    );

    this.server.to(payload.roomPin).emit(
      RoomEvent.PARTICIPANT_JOINED,
      convertCamelToSnake({
        newParticipant: participant,
        totalParticipant: room.participants.size,
      }),
    );

    client.data.roomPin = payload.roomPin;
    client.data.userId = payload.userId;
    client.data.participantId = newParticipant.id;
  }

  @SubscribeMessage(RoomEvent.LEAVE_ROOM)
  async handleLeaveRoom(
    @MessageBody() payload: LeaveRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.rooms[payload.roomPin];
    if (!room) {
      throw new WsException('Room not found.');
    }

    room.participants.delete(payload.participantId);
    client.leave(payload.roomPin);

    const participant = this.participants[payload.participantId];
    if (!participant) {
      throw new WsException('Participant not found.');
    }
    this.logger.log(
      `Participant [${participant.socketId} - ${participant.userId} - ${participant.nickName}] leaved room ${payload.roomPin}.`,
    );

    this.server.to(payload.roomPin).emit(
      RoomEvent.PARTICIPANT_LEFT,
      convertCamelToSnake({
        participantLeft: participant,
        totalParticipant: room.participants.size,
      }),
    );
    participant.timeLeft = new Date();

    await this.storeParticipantInfo(participant);
    delete this.participants[payload.participantId];
    this.clients.delete(payload.participantId);

    await this.participantInRoomService.leaveRoom(
      room.roomId,
      payload.participantId,
    );
  }

  @SubscribeMessage(RoomEvent.KICK_PARTICIPANT)
  async handleKickParticipantInRoom(
    @MessageBody(new WsValidationPipe()) payload: KickParticipantDto,
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.rooms[payload.roomPin];
    if (!room) {
      throw new WsException('Room not found.');
    }

    if (!this.isHostInRoom(payload.hostId, client.id, room)) {
      throw new WsException('Only the host can kick participant in room.');
    }

    const socket = this.clients.get(payload.participantId);
    if (!socket) {
      throw new WsException(
        `No participant with participantId: ${payload.participantId} exists in room ${payload.roomPin}.`,
      );
    }

    const participant = this.participants[payload.participantId];
    if (!participant) {
      throw new WsException('Participant not found.');
    }
    room.participants.delete(payload.participantId);

    this.server.to(payload.roomPin).emit(
      RoomEvent.KICK_PARTICIPANT,
      convertCamelToSnake({
        participantLeft: participant,
        totalParticipant: room.participants.size,
      }),
    );

    socket.emit(RoomEvent.PARTICIPANT_KICKED, {
      reason: 'You were removed from the room by the host.',
    });
    socket.leave(payload.roomPin);

    await this.storeParticipantInfo(participant);
    delete this.participants[payload.participantId];
    this.clients.delete(payload.participantId);

    await this.participantInRoomService.kickParticipant(
      room.host.userId,
      room.roomId,
      payload.participantId,
    );
  }

  @SubscribeMessage(RoomEvent.LOCK_ROOM)
  async handleLockRoom(
    @MessageBody(new WsValidationPipe()) payload: LockRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.rooms[payload.roomPin];
    if (!room) {
      throw new WsException('Room not found.');
    }

    if (!this.isHostInRoom(payload.hostId, client.id, room)) {
      throw new WsException('Only the host can lock the room.');
    }

    room.locked = true;
    this.server
      .to(payload.roomPin)
      .emit(RoomEvent.ROOM_LOCKED, convertCamelToSnake({ locked: true }));
    this.logger.log(`Room with pin: ${payload.roomPin} is now locked.`);

    await this.roomService.updateRoom(room.roomId, {
      locked: true,
    });
  }

  @SubscribeMessage(RoomEvent.UNLOCK_ROOM)
  async handleUnlockRoom(
    @MessageBody(new WsValidationPipe()) payload: LockRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.rooms[payload.roomPin];
    if (!room) {
      throw new WsException('Room not found.');
    }

    if (!this.isHostInRoom(payload.hostId, client.id, room)) {
      throw new WsException('Only the host can unlock the room.');
    }

    room.locked = false;
    this.server
      .to(payload.roomPin)
      .emit(RoomEvent.ROOM_LOCKED, { locked: false });
    this.logger.log(`Room with pin: ${payload.roomPin} is now unlocked`);

    await this.roomService.updateRoom(room.roomId, { locked: false });
  }

  @SubscribeMessage(RoomEvent.SETTING_ROOM)
  async handleSettingRoom(
    @MessageBody(new WsValidationPipe()) payload: SettingRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.rooms[payload.roomPin];
    if (!room) {
      throw new WsException('Room not found.');
    }

    if (!this.isHostInRoom(payload.hostId, client.id, room)) {
      throw new WsException('Only the host can setting in room.');
    }

    if (room.endTime) {
      throw new WsException(
        'The quiz session has already ended. Settings cannot be modified.',
      );
    }

    const dto = {
      isAutoPlay: payload.isAutoPlay,
      isShowQuestion: payload.isShowQuestion,
      lobbyMusic: payload.lobbyMusic,
    };
    updatePropertiesIfDefined<RoomModel>(room, dto, [
      'isAutoPlay',
      'isShowQuestion',
      'lobbyMusic',
    ]);

    const roomSetting = await this.roomService.settingRoom(
      payload.hostId as Uuid,
      room.roomId,
      dto,
    );

    if (!roomSetting) {
      throw new WsException('Internal Server Error.');
    }

    this.server.to(payload.roomPin).emit(
      RoomEvent.SETTING_ROOM,
      convertCamelToSnake({
        roomPin: payload.roomPin,
        roomId: room.roomId,
        isShowQuestion: room.isShowQuestion,
        isAutoPlay: room.isAutoPlay,
        lobbyMusic: room.lobbyMusic,
      }),
    );
  }

  @SubscribeMessage(RoomEvent.START_QUIZ)
  async handleStartQuiz(
    @MessageBody(new WsValidationPipe()) payload: StartQuizDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomPin, quizzflyId } = payload;

    const room = this.rooms[roomPin];
    if (!room) {
      throw new WsException('Room not found.');
    }

    if (!this.isHostInRoom(payload.hostId, client.id, room)) {
      throw new WsException('Only the host can start the quiz.');
    }

    if (room.startTime) {
      throw new WsException('Quiz has been started.');
    }

    const questions = await this.eventService.emitAsync(
      new GetQuestionsEvent({
        userId: room.host.userId,
        quizzflyId: quizzflyId as Uuid,
      }),
    );

    if (!questions || questions.length === 0) {
      throw new WsException(
        'Question set not found. Please check the ID and try again.',
      );
    }

    const items = questions.map((question: any, index: number) => {
      delete question.id;
      if (question.type === 'SLIDE') {
        return new QuestionEntity({
          ...question,
          roomId: room.roomId,
          questionIndex: index,
          startTime: index === 0 ? new Date() : undefined,
        });
      } else {
        const choices: Record<Uuid, number> = {};
        const answers: Record<Uuid, AnswerInRoom> = {};
        let correctAnswerId: Uuid;

        question?.answers.forEach((answer: AnswerEntity) => {
          choices[answer.id] = 0;
          answers[answer.id] = {
            id: answer.id,
            content: answer.content,
            index: answer.index,
            files: answer.files,
            isCorrect: answer.isCorrect,
          };
          if (answer.isCorrect) {
            correctAnswerId = answer.id;
          }
        });

        return new QuestionEntity({
          ...question,
          roomId: room.roomId,
          questionIndex: index,
          startTime: index === 0 ? new Date() : undefined,
          correctAnswerId,
          choices,
          answers,
        });
      }
    });

    const questionsStored = await this.questionService.insertMany(
      room.host.userId,
      room.roomId,
      items,
    );

    room.questions = {};
    questionsStored.forEach((question) => {
      if (!room.questions[question.questionIndex]) {
        room.questions[question.questionIndex] = question;
      }
    });

    room.startTime = Date.now();
    room.currentQuestion = questionsStored[0];
    room.currentQuestion.startTime = questionsStored[0].startTime;
    room.currentQuestionIndex = room.currentQuestion.questionIndex;
    room.currentQuestion.noParticipantAnswered = 0;

    // for participant
    const question = JSON.parse(
      JSON.stringify(room.currentQuestion),
    ) as Question;

    if (question.type === 'QUIZ') {
      delete question.correctAnswerId;
      Object.values(question.answers).forEach((answer) => {
        delete answer.isCorrect;
      });
    }

    this.sendDataForParticipant(room, RoomEvent.QUIZ_STARTED, {
      roomPin: payload.roomPin,
      startTime: room.currentQuestion.startTime,
      question,
    });

    // for host
    client.emit(
      RoomEvent.QUIZ_STARTED,
      convertCamelToSnake({
        roomPin,
        startTime: room.currentQuestion.startTime,
        question: room.currentQuestion,
        questions: questionsStored,
      }),
    );
    this.logger.log(`Quiz started in room: ${roomPin}.`);

    await this.roomService.updateRoom(room.roomId, { startTime: new Date() });
  }

  @SubscribeMessage(RoomEvent.NEXT_QUESTION)
  async handleNextQuestion(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe()) payload: NextQuestionDto,
  ) {
    const room = this.rooms[payload.roomPin];
    if (!room) {
      throw new WsException('Room not found.');
    }

    if (!this.isHostInRoom(payload.hostId, client.id, room)) {
      throw new WsException('Only the host can get next question.');
    }

    if (!room.startTime) {
      throw new WsException('Quiz has not started.');
    }

    if (room.currentQuestion.type === 'QUIZ' && !room.currentQuestion.done) {
      throw new WsException('Previous question not finished.');
    }

    room.currentQuestion.done = true;
    const question = room.questions[room.currentQuestionIndex + 1];
    if (!question) {
      room.endTime = Date.now();
      throw new WsException('The quiz has run out of questions.');
    }

    room.currentQuestion = question;
    room.currentQuestion.startTime = new Date();
    room.currentQuestionIndex = question.questionIndex;

    if (room.currentQuestion.type === 'QUIZ') {
      room.currentQuestion.noParticipantAnswered = 0;
    }

    // for participant
    const data = JSON.parse(JSON.stringify(room.currentQuestion)) as Question;

    if (data.type === 'QUIZ') {
      delete data.correctAnswerId;
      Object.values(data.answers).forEach((answer) => {
        delete answer.isCorrect;
      });
    }

    this.sendDataForParticipant(room, RoomEvent.QUIZ_STARTED, {
      roomPin: payload.roomPin,
      startTime: room.currentQuestion.startTime,
      question: data,
    });

    // for host
    client.emit(
      RoomEvent.NEXT_QUESTION,
      convertCamelToSnake({
        roomPin: payload.roomPin,
        startTime: room.currentQuestion.startTime,
        question: question,
      }),
    );

    await this.questionService.updateQuestion(room.currentQuestion.id, {
      startTime: room.currentQuestion.startTime,
    });
  }

  @SubscribeMessage(RoomEvent.ANSWER_QUESTION)
  async handleAnswerQuestion(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe()) payload: AnswerQuestionDto,
  ) {
    const room = <RoomModel>(
      Optional.of(this.rooms[payload.roomPin])
        .throwIfNotPresent(new WsException('Room not found.'))
        .get()
    );

    const participant: ParticipantModel = Optional.of(
      this.participants[payload.participantId],
    )
      .throwIfNotPresent(new WsException('Participant invalid.'))
      .get();

    const question = room.currentQuestion;
    if (question.type !== 'QUIZ') {
      throw new WsException('Not allowed.');
    }

    if (question.done) {
      throw new WsException('Question is over.');
    }
    question.noParticipantAnswered += 1;

    const calculateScore = new CalculateScoreUtil({
      baseScore: 1000,
      startTime: new Date(question.startTime).getTime(),
      timeLimit: question.timeLimit,
      responseTime: Date.now(),
      isCorrect: payload.answerId === question.correctAnswerId,
      pointMultiplier: question.pointMultiplier,
    });
    const score = calculateScore.score;

    if (!participant.answers[payload.questionId]) {
      participant.answers[payload.questionId] = {
        questionId: payload.questionId,
        chosenAnswerId: payload.answerId,
        isCorrect: question.correctAnswerId === payload.answerId,
        score,
      };
    } else {
      throw new WsException('You have answered this question.');
    }

    if (!question.choices[payload.answerId]) {
      question.choices[payload.answerId] = 1;
    } else {
      question.choices[payload.answerId] += 1;
    }

    participant.totalScore = participant.totalScore
      ? participant.totalScore + score
      : score;
    client.emit(RoomEvent.ANSWER_QUESTION, { message: 'Waiting...' });

    // for host
    const host = this.clients.get(room.host.userId);
    host.emit(
      RoomEvent.ANSWER_QUESTION,
      convertCamelToSnake({
        noParticipantAnswered: question.noParticipantAnswered,
      }),
    );

    await this.participantAnswerService.answerQuestion({
      questionId: payload.questionId,
      participantId: payload.participantId,
      chosenAnswerId: payload.answerId,
      isCorrect: question.correctAnswerId === payload.answerId,
      score,
    });
  }

  @SubscribeMessage(RoomEvent.FINISH_QUESTION)
  async handleQuestionFinish(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe()) payload: FinishQuestionDto,
  ) {
    const room = <RoomModel>(
      Optional.of(this.rooms[payload.roomPin])
        .throwIfNotPresent(new WsException('Room not found.'))
        .get()
    );

    if (!this.isHostInRoom(payload.hostId, client.id, room)) {
      throw new WsException(
        'Only the room owner is allowed to perform this action.',
      );
    }

    if (room.currentQuestion.done) {
      throw new WsException('Question is over.');
    }

    room.currentQuestion.done = true;
    // for participant
    Array.from(room.participants).forEach((participantId: string) => {
      const participant = this.participants[participantId];
      const client = this.clients.get(participantId);

      const answerOfParticipantWithQuestion =
        participant.answers[payload.questionId];
      client.emit(
        RoomEvent.RESULT_ANSWER,
        convertCamelToSnake({
          roomPin: payload.roomPin,
          score: answerOfParticipantWithQuestion?.score ?? 0,
          totalScore: participant?.totalScore ?? 0,
          isCorrect: answerOfParticipantWithQuestion?.isCorrect ?? false,
          questionId: payload.questionId,
          correctAnswerId: room.currentQuestion?.correctAnswerId ?? null,
          chosenAnswerId:
            answerOfParticipantWithQuestion?.chosenAnswerId ?? null,
        }),
      );
    });

    // for host
    client.emit(
      RoomEvent.SUMMARY_ANSWER,
      convertCamelToSnake({
        roomPin: payload.roomPin,
        questionId: payload.questionId,
        correctAnswerId: room.currentQuestion?.correctAnswerId ?? null,
        choices: room.currentQuestion?.choices ?? null,
      }),
    );

    await this.questionService.updateQuestion(room.currentQuestion.id, {
      done: true,
      choices: room.currentQuestion.choices,
    });
  }

  @SubscribeMessage(RoomEvent.UPDATE_LEADERBOARD)
  async handleUpdateLeaderBoard(
    @MessageBody(new WsValidationPipe()) payload: UpdateLeaderBoardDto,
    @ConnectedSocket() client: Socket,
  ) {
    const room: RoomModel = this.rooms[payload.roomPin];
    if (!room) {
      throw new WsException('Room not found.');
    }

    if (!this.isHostInRoom(payload.hostId, client.id, room)) {
      throw new WsException(
        'Only the room owner is allowed to perform this action.',
      );
    }

    const question = room.currentQuestion;
    if (!question.done) {
      throw new WsException('Unfinished question.');
    }
    question.endTime = new Date();

    const leaderBoard: Partial<ParticipantModel & { score: number }>[] = [];
    Array.from(room.participants).forEach((participantId: string) => {
      const participant = this.participants[participantId];
      leaderBoard.push({
        id: participant.id,
        userId: participant.userId,
        socketId: participant.socketId,
        nickName: participant.nickName,
        score: participant.answers[payload.questionId]?.score ?? 0,
        totalScore: participant?.totalScore ?? 0,
        rank: 0,
      });
    });

    const items = updateRank(leaderBoard);
    this.server.to(payload.roomPin).emit(
      RoomEvent.UPDATE_LEADERBOARD,
      convertCamelToSnake({
        roomPin: payload.roomPin,
        leaderBoard: items,
      }),
    );

    const participantsStore: Partial<ParticipantInRoomEntity>[] = items.map(
      (item) => {
        return {
          id: item.id,
          totalScore: item.totalScore ?? 0,
          rank: item.rank,
        };
      },
    );

    await this.participantInRoomService.updateMultipleParticipant(
      participantsStore,
    );
  }

  @SubscribeMessage(RoomEvent.PARTICIPANT_RECONNECT)
  async handleParticipantReconnect(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe()) payload: ParticipantDto,
  ) {
    const room: RoomModel = this.rooms[payload.roomPin];
    if (!room) {
      throw new WsException('Room not found.');
    }

    const participant = <ParticipantModel>Optional.of(
      await this.getParticipantInfoFromCache(payload.participantId),
    )
      .throwIfNotPresent(
        new WsException('Participant invalid or time out reconnect.'),
      )
      .get();

    this.participants[payload.participantId] = participant;

    participant.socketId = client.id;
    room.participants.add(payload.participantId);
    this.server.to(payload.roomPin).emit(
      RoomEvent.PARTICIPANT_RECONNECTED,
      convertCamelToSnake({
        participant,
        totalParticipant: room.participants.size,
      }),
    );

    client.join(payload.roomPin);
    this.clients.set(payload.participantId, client);

    const responseData: any = { participant, roomPin: payload.roomPin };
    // phase lobby
    if (!room.startTime) {
      responseData.state = RoomPhase.LOBBY;
    }
    // phase question in progress
    else if (!room.currentQuestion.done && room.currentQuestion.startTime) {
      responseData.state = RoomPhase.QUESTION_STARTED;

      if (room.currentQuestion.type === 'QUIZ') {
        const question = JSON.parse(
          JSON.stringify(room.currentQuestion),
        ) as Question;
        delete question.correctAnswerId;
        Object.values(question.answers).forEach((answer) => {
          delete answer.isCorrect;
        });

        responseData.question = {
          ...question,
          timeLeft:
            new Date(question.startTime).getTime() +
            question.timeLimit * 60 -
            Date.now(),
        };
      } else {
        responseData.question = room.currentQuestion;
      }
    }
    // phase question done
    else if (
      room.currentQuestion.done &&
      room.currentQuestion.type === 'QUIZ' &&
      !room.currentQuestion.endTime
    ) {
      responseData.state = RoomPhase.QUESTION_END;
      const answerOfParticipantWithQuestion =
        participant.answers[room.currentQuestion.id];

      responseData.result = {
        score: answerOfParticipantWithQuestion?.score ?? 0,
        totalScore: participant?.totalScore ?? 0,
        isCorrect: answerOfParticipantWithQuestion?.isCorrect ?? false,
        questionId: room.currentQuestion.roomId,
        correctAnswerId: room.currentQuestion?.correctAnswerId ?? null,
        chosenAnswerId: answerOfParticipantWithQuestion?.chosenAnswerId ?? null,
      };
    }
    // phase show leaderboard
    else if (room.currentQuestion.endTime) {
      responseData.state = RoomPhase.UPDATE_RANK;
      const leaderBoard: Partial<ParticipantModel & { score: number }>[] = [];
      Array.from(room.participants).forEach((participantId: string) => {
        const participant = this.participants[participantId];
        leaderBoard.push({
          id: participant.id,
          userId: participant.userId,
          socketId: participant.socketId,
          nickName: participant.nickName,
          score: participant.answers[room.currentQuestion.id]?.score ?? 0,
          totalScore: participant?.totalScore ?? 0,
          rank: 0,
        });
      });

      responseData.leaderBoard = updateRank(leaderBoard);
    }

    client.emit(
      RoomEvent.PARTICIPANT_RECONNECTED_SUCCESS,
      convertCamelToSnake(responseData),
    );
  }

  handleHostDisconnect(room: RoomModel) {
    this.server.to(room.roomPin).emit(
      RoomEvent.ROOM_CANCELED,
      convertCamelToSnake({
        disconnectRoom: true,
        message: 'The host has disconnected. Please wait or rejoin later.',
      }),
    );

    Array.from(room.participants).forEach((participantId: string) => {
      const participant = this.participants[participantId];
      if (participant) {
        delete this.participants[participantId];
      }

      const socketParticipant = this.clients[participantId];
      if (socketParticipant) {
        this.clients.delete(participantId);
      }
    });

    this.server.in(room.roomPin).socketsLeave(room.roomPin);
    delete this.rooms[room.roomPin];
    this.clients.delete(room.host.socketId);
  }

  async handleParticipantDisconnect(
    participant: ParticipantModel,
    room: RoomModel,
  ) {
    await this.storeParticipantInfo(participant);

    room.participants.delete(participant.id);

    const socketClient = this.clients.get(participant.id);
    socketClient.leave(room.roomPin);

    this.server.to(room.roomPin).emit(
      RoomEvent.PARTICIPANT_LEFT,
      convertCamelToSnake({
        participantLeft: participant,
        totalParticipant: room.participants.size,
      }),
    );

    delete this.participants[participant.id];
    this.clients.delete(participant.id);
  }

  sendDataForParticipant<T extends object = any>(
    room: RoomModel,
    event: RoomEvent,
    data: T,
  ) {
    Array.from(room.participants).map((participantId: string) => {
      const client = this.clients.get(participantId);
      if (!client) {
        return;
      }

      client.emit(event, convertCamelToSnake(data));
    });
  }

  isHostInRoom(hostId: Uuid, socketId: string, room: RoomModel): boolean {
    return hostId === room.host.userId && socketId === room.host.socketId;
  }

  isParticipantInRoom(participantId: Uuid, room: RoomModel) {
    return room.participants.has(participantId);
  }

  async storeParticipantInfo(
    participant: ParticipantModel,
    ttl: number = CacheTTL.minutes(10),
  ) {
    await this.cacheService.set(
      CreateCacheKey(CacheKey.PARTICIPANT_IN_ROOM, participant.id),
      participant,
      ttl,
    );
  }

  async getParticipantInfoFromCache(participantId: Uuid) {
    const participant = await this.cacheService.get<ParticipantModel>(
      CreateCacheKey(CacheKey.PARTICIPANT_IN_ROOM, participantId),
    );

    return participant;
  }
}
