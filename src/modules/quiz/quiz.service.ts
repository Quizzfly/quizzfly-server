import { Uuid } from '@common/types/common.type';
import { defaultInstanceEntity } from '@core/constants/app.constant';
import { ErrorCode } from '@core/constants/error-code/error-code.constant';
import { EventService } from '@core/events/event.service';
import { Optional } from '@core/utils/optional';
import { AnswerEntity } from '@modules/answer/entities/answer.entity';
import {
  DuplicateAnswersEvent,
  InsertManyAnswerEvent,
} from '@modules/answer/events';
import { CreateMultipleQuizGeneratedReqDto } from '@modules/quiz/dto/request/create-multiple-quiz-generated.req.dto';
import { CreateQuizReqDto } from '@modules/quiz/dto/request/create-quiz.req.dto';
import { QuizResDto } from '@modules/quiz/dto/response/quiz.res.dto';
import { QuizEntity } from '@modules/quiz/entities/quiz.entity';
import {
  QuizAction,
  QuizScope,
  UpdateManyQuizDto,
  UpdatePositionQuizPayload,
} from '@modules/quiz/events';
import { QuizRepository } from '@modules/quiz/repositories/quiz.repository';
import { QuizzflyService } from '@modules/quizzfly/quizzfly.service';
import { UpdatePositionSlideEvent } from '@modules/slide/events';
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Transactional } from 'typeorm-transactional';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly quizzflyService: QuizzflyService,
    private readonly eventService: EventService,
  ) {}

  @Transactional()
  async create(userId: Uuid, quizzflyId: Uuid, dto: CreateQuizReqDto) {
    const quizzfly = await this.quizzflyService.findById(quizzflyId);
    if (quizzfly.userId !== userId) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }
    const currentLastQuestion =
      await this.quizzflyService.getLastQuestion(quizzflyId);

    const quiz = new QuizEntity(dto);
    quiz.quizzflyId = quizzflyId;
    quiz.prevElementId =
      currentLastQuestion !== null ? currentLastQuestion.id : null;
    await this.quizRepository.save(quiz);

    return quiz.toDto(QuizResDto);
  }

  @Transactional()
  async createBatch(
    userId: Uuid,
    quizzflyId: Uuid,
    dto: CreateMultipleQuizGeneratedReqDto,
  ) {
    const quizzfly = await this.quizzflyService.findById(quizzflyId);
    if (quizzfly.userId !== userId) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }
    const currentLastQuestion =
      await this.quizzflyService.getLastQuestion(quizzflyId);

    const quizzesInsert: Array<QuizEntity> = [];
    const answersInsert: Array<AnswerEntity> = [];
    let prevElementId = currentLastQuestion.id;

    const quizzesForResponse = dto.quizzes.map((quiz) => {
      const id = uuidv4();
      const quizEntity = new QuizEntity({
        ...quiz,
        id,
        answers: undefined,
      } as QuizEntity);
      quizEntity.quizzflyId = quizzflyId;
      quizEntity.prevElementId = prevElementId;

      const answersEntity = quiz.answers.map((answer, index) => {
        const answerEntity = new AnswerEntity({
          ...answer,
          quizId: id as Uuid,
          index,
          id: uuidv4() as Uuid,
        });

        return answerEntity;
      });

      answersInsert.push(...answersEntity);
      quizzesInsert.push(quizEntity);
      prevElementId = id;

      return { ...quizEntity, type: 'QUIZ', answers: answersEntity };
    });

    await this.quizRepository.save(quizzesInsert).then(async () => {
      await this.eventService.emitAsync(
        new InsertManyAnswerEvent(answersInsert),
      );
    });

    return quizzesForResponse;
  }

  async findOneById(quizId: Uuid) {
    const quiz: QuizEntity = Optional.of(
      await this.quizRepository.findOne({
        where: { id: quizId },
        relations: ['answers'],
      }),
    )
      .throwIfNullable(new NotFoundException(ErrorCode.QUIZ_NOT_FOUND))
      .get();
    return quiz.toDto(QuizResDto);
  }

  @OnEvent(`${QuizScope}.${QuizAction.getQuizEntity}`)
  async findOneDetailById(quizId: Uuid) {
    const quiz: QuizEntity = Optional.of(
      await this.quizRepository.findOne({
        where: { id: quizId },
        relations: ['quizzfly'],
      }),
    )
      .throwIfNullable(new NotFoundException(ErrorCode.QUIZ_NOT_FOUND))
      .get();

    return quiz;
  }

  async duplicateQuiz(quizzflyId: Uuid, quizId: Uuid, userId: Uuid) {
    const quiz = await this.findOneDetailById(quizId);
    if (quiz.quizzfly.userId !== userId || quiz.quizzfly.id !== quizzflyId) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }
    const behindQuestion = await this.quizzflyService.getBehindQuestion(
      quizzflyId,
      quizId,
    );

    delete quiz.quizzfly;
    const dto = { ...quiz, ...defaultInstanceEntity };
    const quizDuplicate = new QuizEntity(dto);
    quizDuplicate.prevElementId = quiz.id;
    await quizDuplicate.save();

    const answers = await this.eventService.emitAsync(
      new DuplicateAnswersEvent({
        quizId,
        duplicateQuizId: quizDuplicate.id,
      }),
    );

    if (answers && answers.length > 0) {
      quizDuplicate.answers = answers;
    }

    if (behindQuestion !== null) {
      if (behindQuestion.type === 'SLIDE') {
        await this.eventService.emitAsync(
          new UpdatePositionSlideEvent({
            slideId: behindQuestion.id,
            prevElementId: quizDuplicate.id,
          }),
        );
      } else {
        await this.changePrevPointerQuiz({
          quizId: behindQuestion.id,
          prevElementId: quizDuplicate.id,
        });
      }
    }

    return quizDuplicate;
  }

  async updateOne(
    quizzflyId: Uuid,
    quizId: Uuid,
    userId: Uuid,
    dto: Partial<QuizEntity>,
  ) {
    const quiz = await this.findOneDetailById(quizId);
    if (quiz.quizzfly.userId !== userId || quiz.quizzfly.id !== quizzflyId) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }

    Object.assign(quiz, dto);
    await this.quizRepository.save(quiz);

    return quiz.toDto(QuizResDto);
  }

  @OnEvent(`${QuizScope}.${QuizAction.setBackgroundForManyQuiz}`)
  async updateMany(payload: UpdateManyQuizDto) {
    return this.quizRepository.update(
      { quizzflyId: payload.quizzflyId as Uuid },
      payload.dto,
    );
  }

  async deleteOne(quizzflyId: Uuid, quizId: Uuid, userId: Uuid) {
    const quiz = await this.findOneDetailById(quizId);
    if (quiz.quizzfly.userId !== userId || quiz.quizzfly.id !== quizzflyId) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }

    await this.quizRepository.softDelete({ id: quizId });

    const behindQuestion = await this.quizzflyService.getBehindQuestion(
      quizzflyId,
      quizId,
    );
    if (behindQuestion !== null) {
      if (behindQuestion.type === 'SLIDE') {
        await this.eventService.emitAsync(
          new UpdatePositionSlideEvent({
            slideId: behindQuestion.id,
            prevElementId: quiz.prevElementId,
          }),
        );
      } else {
        await this.changePrevPointerQuiz({
          quizId: behindQuestion.id,
          prevElementId: quiz.prevElementId,
        });
      }
    }
  }

  @OnEvent(`${QuizScope}.${QuizAction.updatePosition}`)
  async changePrevPointerQuiz(payload: UpdatePositionQuizPayload) {
    const quiz = await this.findOneDetailById(payload.quizId);
    quiz.prevElementId = payload.prevElementId;
    await this.quizRepository.save(quiz);
  }
}
