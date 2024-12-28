import { Uuid } from '@common/types/common.type';
import { CacheKey } from '@core/constants/cache.constant';
import { ErrorCode } from '@core/constants/error-code/error-code.constant';
import { EventService } from '@core/events/event.service';
import { WebsocketExceptionFilter } from '@core/filters/websocket-exception.filter';
import { convertCamelToSnake, updatePropertiesIfDefined } from '@core/helpers';
import { WsValidationPipe } from '@core/pipes/ws-validation.pipe';
import { Optional } from '@core/utils/optional';
import { CacheTTL } from '@libs/redis/utils/cache-ttl.utils';
import { CreateCacheKey } from '@libs/redis/utils/create-cache-key.utils';
import { AnswerEntity } from '@modules/answer/entities/answer.entity';
import { GetQuestionsEvent } from '@modules/quizzfly/events/quizzfly.event';
import { RoomStatus } from '@modules/room/entities/constants/room-status.enum';
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
import { HostDto } from '@modules/room/payload/host.dto';
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
import { QuestionDto } from '@modules/room/payload/response/question.dto';
import { QuizFinishedDto } from '@modules/room/payload/response/quiz-finished.dto';
import { QuizStartedDto } from '@modules/room/payload/response/quiz-started.dto';
import { ParticipantAnswerService } from '@modules/room/services/participant-answer.service';
import { ParticipantInRoomService } from '@modules/room/services/participant-in-room.service';
import { QuestionService } from '@modules/room/services/question.service';
import { RoomService } from '@modules/room/services/room.service';
import { calculateResult } from '@modules/room/utils/calculate-result.util';
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
import { plainToInstance } from 'class-transformer';
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
    this.logger.log('Room gateway has been initialized');
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
    Optional.of(this.rooms[payload.roomPin]).throwIfPresent(
      new WsException(ErrorCode.ROOM_PIN_ALREADY_EXISTS),
    );

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
    if (payload.participantId) {
      await this.handleParticipantReconnect(
        { roomPin: payload.roomPin, participantId: payload.participantId },
        client,
      );
    } else {
      await this.handleNewParticipantJoinRoom(payload, client);
    }
  }

  @SubscribeMessage(RoomEvent.LEAVE_ROOM)
  async handleLeaveRoom(
    @MessageBody() payload: LeaveRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const room = Optional.of(this.rooms[payload.roomPin])
      .throwIfNotPresent(new WsException(ErrorCode.ROOM_NOT_FOUND))
      .get() as RoomModel;

    room.participants.delete(payload.participantId);
    client.leave(payload.roomPin);

    const participant = Optional.of(this.participants[payload.participantId])
      .throwIfNotPresent(new WsException(ErrorCode.PARTICIPANT_NOT_FOUND))
      .get() as ParticipantModel;

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
    const room = Optional.of(this.rooms[payload.roomPin])
      .throwIfNotPresent(new WsException(ErrorCode.ROOM_NOT_FOUND))
      .get() as RoomModel;

    if (!this.isHostInRoom(payload.hostId, client.id, room)) {
      throw new WsException(ErrorCode.ONLY_HOST_CAN_KICK_PARTICIPANT);
    }

    const socket = Optional.of(this.clients.get(payload.participantId))
      .throwIfNotPresent(new WsException(ErrorCode.PARTICIPANT_NOT_FOUND))
      .get() as Socket;

    const participant = Optional.of(this.participants[payload.participantId])
      .throwIfNotPresent(new WsException(ErrorCode.PARTICIPANT_NOT_FOUND))
      .get() as ParticipantModel;

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
    const room = Optional.of(this.rooms[payload.roomPin])
      .throwIfNotPresent(new WsException(ErrorCode.ROOM_NOT_FOUND))
      .get() as RoomModel;

    if (!this.isHostInRoom(payload.hostId, client.id, room)) {
      throw new WsException(ErrorCode.ONLY_HOST_CAN_LOCK_ROOM);
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
    const room = Optional.of(this.rooms[payload.roomPin])
      .throwIfNotPresent(new WsException(ErrorCode.ROOM_NOT_FOUND))
      .get() as RoomModel;

    if (!this.isHostInRoom(payload.hostId, client.id, room)) {
      throw new WsException(ErrorCode.ONLY_HOST_CAN_UNLOCK_ROOM);
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
    const room = Optional.of(this.rooms[payload.roomPin])
      .throwIfNotPresent(new WsException(ErrorCode.ROOM_NOT_FOUND))
      .get() as RoomModel;

    if (!this.isHostInRoom(payload.hostId, client.id, room)) {
      throw new WsException(ErrorCode.ONLY_HOST_CAN_SETTING_ROOM);
    }

    if (room.endTime)
      throw new WsException(
        ErrorCode.QUIZ_SESSION_ENDED_CANNOT_MODIFY_SETTINGS,
      );

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

    Optional.of(
      await this.roomService.settingRoom(
        payload.hostId as Uuid,
        room.roomId,
        dto,
      ),
    ).throwIfNullable(new WsException('Internal Server Error.'));

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

    const room = Optional.of(this.rooms[payload.roomPin])
      .throwIfNotPresent(new WsException(ErrorCode.ROOM_NOT_FOUND))
      .get() as RoomModel;

    if (!this.isHostInRoom(payload.hostId, client.id, room)) {
      throw new WsException(ErrorCode.ONLY_HOST_CAN_START_QUIZ);
    }

    if (room.startTime) throw new WsException(ErrorCode.QUIZ_ALREADY_STARTED);

    const questions = Optional.of(
      await this.eventService.emitAsync(
        new GetQuestionsEvent({
          userId: room.host.userId,
          quizzflyId: quizzflyId as Uuid,
        }),
      ),
    )
      .throwIfNotPresent(new WsException(ErrorCode.QUESTION_SET_NOT_FOUND))
      .get() as Array<any>;

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
      this.initResultAnswerForParticipant(room, room.currentQuestion);
    }

    this.sendDataForParticipant(
      room,
      RoomEvent.QUIZ_STARTED,
      plainToInstance(QuizStartedDto, {
        roomPin: payload.roomPin,
        startTime: room.currentQuestion.startTime,
        question,
      }),
    );

    // for host
    client.emit(
      RoomEvent.QUIZ_STARTED,
      convertCamelToSnake(
        plainToInstance(QuizStartedDto, {
          roomPin,
          startTime: room.currentQuestion.startTime,
          question: room.currentQuestion,
          questions: questionsStored,
        }),
      ),
    );
    this.logger.log(`Quiz started in room: ${roomPin}.`);

    await this.roomService.updateRoom(room.roomId, {
      startTime: new Date(room.startTime),
      roomStatus: RoomStatus.IN_PROGRESS,
    });
  }

  @SubscribeMessage(RoomEvent.NEXT_QUESTION)
  async handleNextQuestion(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe()) payload: NextQuestionDto,
  ) {
    const room = Optional.of(this.rooms[payload.roomPin])
      .throwIfNotPresent(new WsException(ErrorCode.ROOM_NOT_FOUND))
      .get() as RoomModel;

    if (!this.isHostInRoom(payload.hostId, client.id, room)) {
      throw new WsException(ErrorCode.ONLY_HOST_CAN_GET_NEXT_QUESTION);
    }

    if (!room.startTime) {
      throw new WsException(ErrorCode.QUIZ_NOT_STARTED);
    }

    if (room.currentQuestion.type === 'QUIZ' && !room.currentQuestion.done) {
      throw new WsException(ErrorCode.PREVIOUS_QUESTION_NOT_FINISHED);
    }

    room.currentQuestion.done = true;
    const question = room.questions[room.currentQuestionIndex + 1];
    if (!question) {
      room.endTime = Date.now();
      throw new WsException(ErrorCode.QUIZ_OUT_OF_QUESTIONS);
    }

    room.currentQuestion = question;
    room.currentQuestion.startTime = new Date();
    room.currentQuestionIndex = question.questionIndex;

    if (room.currentQuestion.type === 'QUIZ') {
      room.currentQuestion.noParticipantAnswered = 0;
      this.initResultAnswerForParticipant(room, room.currentQuestion);
    }

    // for participant
    const data = JSON.parse(JSON.stringify(room.currentQuestion)) as Question;

    if (data.type === 'QUIZ') {
      delete data.correctAnswerId;
      Object.values(data.answers).forEach((answer) => {
        delete answer.isCorrect;
      });
    }

    this.sendDataForParticipant(
      room,
      RoomEvent.QUIZ_STARTED,
      plainToInstance(QuizStartedDto, {
        roomPin: payload.roomPin,
        startTime: room.currentQuestion.startTime,
        question: data,
      }),
    );

    // for host
    client.emit(
      RoomEvent.NEXT_QUESTION,
      convertCamelToSnake(
        plainToInstance(QuizStartedDto, {
          roomPin: payload.roomPin,
          startTime: room.currentQuestion.startTime,
          question: question,
        }),
      ),
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
    const room = Optional.of(this.rooms[payload.roomPin])
      .throwIfNotPresent(new WsException(ErrorCode.ROOM_NOT_FOUND))
      .get() as RoomModel;

    const participant = Optional.of(this.participants[payload.participantId])
      .throwIfNotPresent(new WsException(ErrorCode.PARTICIPANT_INVALID))
      .get() as ParticipantModel;

    const question = room.currentQuestion;
    if (question.type !== 'QUIZ') {
      throw new WsException(ErrorCode.NOT_ALLOWED);
    }

    if (question.done) {
      throw new WsException(ErrorCode.QUESTION_OVER);
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

    Optional.of(
      participant.answers[payload.questionId].chosenAnswerId,
    ).throwIfPresent(new WsException(ErrorCode.QUESTION_ALREADY_ANSWERED));
    participant.answers[payload.questionId] = {
      questionId: payload.questionId,
      chosenAnswerId: payload.answerId,
      isCorrect: question.correctAnswerId === payload.answerId,
      score,
    };

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
  async handleFinishQuestion(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe()) payload: FinishQuestionDto,
  ) {
    const room = Optional.of(this.rooms[payload.roomPin])
      .throwIfNotPresent(new WsException(ErrorCode.ROOM_NOT_FOUND))
      .get() as RoomModel;

    if (!this.isHostInRoom(payload.hostId, client.id, room)) {
      throw new WsException(ErrorCode.ONLY_OWNER_CAN_PERFORM_ACTION);
    }

    if (room.currentQuestion.done) {
      throw new WsException(ErrorCode.QUESTION_OVER);
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
    const room = Optional.of(this.rooms[payload.roomPin])
      .throwIfNotPresent(new WsException(ErrorCode.ROOM_NOT_FOUND))
      .get() as RoomModel;

    if (!this.isHostInRoom(payload.hostId, client.id, room)) {
      throw new WsException(ErrorCode.ONLY_OWNER_CAN_PERFORM_ACTION);
    }

    const question = room.currentQuestion;
    if (!question.done) {
      throw new WsException(ErrorCode.UNFINISHED_QUESTION);
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

  @SubscribeMessage(RoomEvent.FINISH_QUIZ)
  async handleFinishQuiz(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe()) payload: HostDto,
  ) {
    const room = Optional.of(this.rooms[payload.roomPin])
      .throwIfNotPresent(new WsException(ErrorCode.ROOM_NOT_FOUND))
      .get() as RoomModel;

    if (!this.isHostInRoom(payload.hostId, client.id, room)) {
      throw new WsException(ErrorCode.ONLY_OWNER_CAN_PERFORM_ACTION);
    }

    const items: QuizFinishedDto[] = [];
    const participantsStore: Partial<ParticipantInRoomEntity>[] = [];
    // for participant
    Array.from(room.participants).forEach((participantId: string) => {
      const participant = this.participants[participantId];
      const participantClient = this.clients.get(participantId);

      const result = calculateResult(participant.answers);
      participantsStore.push({ id: participant.id, ...result });
      const data: QuizFinishedDto = {
        id: participant.id,
        socketId: participant.socketId,
        userId: participant.userId,
        nickName: participant.nickName,
        roomPin: participant.roomPin,
        totalScore: participant.totalScore,
        rank: participant.rank,
        timeLeft: new Date(participant.timeLeft).getTime(),
        timeJoin: new Date(participant.timeJoin).getTime(),
        isKicked: !!participant.timeKicked,
        totalParticipant: room.participants.size,
        ...result,
      };
      items.push(data);

      participantClient.emit(
        RoomEvent.QUIZ_FINISHED,
        convertCamelToSnake(data),
      );
    });

    // for host
    client.emit(RoomEvent.QUIZ_FINISHED, convertCamelToSnake(items));

    await this.participantInRoomService.updateMultipleParticipant(
      participantsStore,
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

  initResultAnswerForParticipant(room: RoomModel, question: Question) {
    Array.from(room.participants).forEach((participantId) => {
      const participant = this.participants[participantId];
      participant.answers[question.id] = {
        questionId: question.id,
        isCorrect: false,
        score: 0,
      };
    });
  }

  async handleNewParticipantJoinRoom(payload: JoinRoomDto, client: Socket) {
    const room = Optional.of(this.rooms[payload.roomPin])
      .throwIfNotPresent(new WsException(ErrorCode.ROOM_NOT_FOUND))
      .get() as RoomModel;

    if (room.locked) throw new WsException(ErrorCode.ROOM_LOCKED);

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

  async handleParticipantReconnect(payload: ParticipantDto, client: Socket) {
    const room = Optional.of(this.rooms[payload.roomPin])
      .throwIfNotPresent(new WsException(ErrorCode.ROOM_NOT_FOUND))
      .get() as RoomModel;

    const participant = <ParticipantModel>Optional.of(
      await this.getParticipantInfoFromCache(payload.participantId),
    )
      .throwIfNotPresent(
        new WsException(ErrorCode.PARTICIPANT_INVALID_OR_TIMEOUT),
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
          ...plainToInstance(QuestionDto, question),
          timeLeft:
            new Date(question.startTime).getTime() +
            question.timeLimit * 60 -
            Date.now(),
        };
      } else {
        responseData.question = plainToInstance(
          QuestionDto,
          room.currentQuestion,
        );
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
}
