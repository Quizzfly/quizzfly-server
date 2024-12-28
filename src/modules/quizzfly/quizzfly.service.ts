import { OffsetPaginationDto } from '@common/dto/offset-pagination/offset-pagination.dto';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@common/types/common.type';
import { ErrorCode } from '@core/constants/error-code/error-code.constant';
import { EventService } from '@core/events/event.service';
import { Optional } from '@core/utils/optional';
import {
  GetQuizEntityEvent,
  UpdateManyQuizEvent,
  UpdatePositionQuizEvent,
} from '@modules/quiz/events';
import { AdminQueryQuizzflyReqDto } from '@modules/quizzfly/dto/request/admin-query-quizzfly.req.dto';
import { ChangePositionQuestionReqDto } from '@modules/quizzfly/dto/request/change-position-question.req';
import { ChangeThemeQuizzflyReqDto } from '@modules/quizzfly/dto/request/change-theme-quizzfly.req';
import { QueryQuizzflyReqDto } from '@modules/quizzfly/dto/request/query-quizzfly.req.dto';
import { SettingQuizzflyReqDto } from '@modules/quizzfly/dto/request/setting-quizzfly.req';
import { QuizzflyDetailResDto } from '@modules/quizzfly/dto/response/quizzfly-detail.res';
import { QuizzflyResDto } from '@modules/quizzfly/dto/response/quizzfly.res';
import { QuizzflyStatus } from '@modules/quizzfly/entity/enums/quizzfly-status.enum';
import { QuizzflyEntity } from '@modules/quizzfly/entity/quizzfly.entity';
import { QuizzflyContentType } from '@modules/quizzfly/enums/quizzfly-content-type.enum';
import {
  QuizzflyAction,
  QuizzflyScope,
} from '@modules/quizzfly/events/quizzfly.event';
import { QuizzflyRepository } from '@modules/quizzfly/repository/quizzfly.repository';
import {
  GetSlideEntityEvent,
  UpdateManySlideEvent,
  UpdatePositionSlideEvent,
} from '@modules/slide/events';
import { UserService } from '@modules/user/user.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { plainToInstance } from 'class-transformer';
import { FindManyOptions, ILike } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class QuizzflyService {
  constructor(
    private readonly quizzflyRepository: QuizzflyRepository,
    private readonly userService: UserService,
    private readonly eventService: EventService,
  ) {}

  @Transactional()
  async createDraftQuizzfly(userId: Uuid) {
    const draftQuizzfly = new QuizzflyEntity();
    draftQuizzfly.isPublic = true;
    draftQuizzfly.quizzflyStatus = QuizzflyStatus.Draft;
    draftQuizzfly.user = await this.userService.findByUserId(userId);

    await this.quizzflyRepository.save(draftQuizzfly);
    return QuizzflyDetailResDto.toInfoQuizzflyResponse(
      draftQuizzfly,
      draftQuizzfly.user,
    );
  }

  async settingQuizzfly(
    userId: Uuid,
    quizzflyId: Uuid,
    dto: SettingQuizzflyReqDto,
  ) {
    const quizzfly = await this.findById(quizzflyId);

    if (quizzfly.userId !== userId) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }

    Object.assign(quizzfly, dto);
    await this.quizzflyRepository.save(quizzfly);

    return quizzfly.toDto(QuizzflyResDto);
  }

  async getMyQuizzfly(userId: Uuid, filterOptions: QueryQuizzflyReqDto) {
    const user = await this.userService.findByUserId(userId);
    const findOptions: FindManyOptions<QuizzflyEntity> = {};
    const searchCriteria = ['title', 'description'];
    const orWhereOption = [];

    if (filterOptions.keywords) {
      for (const key of searchCriteria) {
        orWhereOption.push({
          [key]: ILike(`%${filterOptions.keywords}%`),
        });
      }
    }
    findOptions.take = filterOptions.limit;
    findOptions.skip = filterOptions.page
      ? (filterOptions.page - 1) * filterOptions.limit
      : 0;
    findOptions.where = { userId: userId };
    findOptions.order = { createdAt: filterOptions.order };

    const [results, totalRecords] =
      await this.quizzflyRepository.findAndCount(findOptions);

    const items = results.map((quizzfly) =>
      QuizzflyDetailResDto.toInfoQuizzflyResponse(quizzfly, user),
    );

    const meta = new OffsetPaginationDto(totalRecords, filterOptions);
    return new OffsetPaginatedDto(items, meta);
  }

  async getListQuizzfly(filterOptions: AdminQueryQuizzflyReqDto) {
    return this.quizzflyRepository.getListQuizzfly(filterOptions);
  }

  async findById(quizzflyId: Uuid) {
    return <QuizzflyEntity>Optional.of(
      await this.quizzflyRepository.findOne({
        where: { id: quizzflyId },
        relations: ['user'],
      }),
    )
      .throwIfNotPresent(new NotFoundException(ErrorCode.QUIZZFLY_NOT_FOUND))
      .get();
  }

  async getDetailQuizzfly(quizzflyId: Uuid) {
    const quizzfly = await this.findById(quizzflyId);
    return quizzfly.toDto(QuizzflyResDto);
  }

  async changeThemeQuizzfly(
    quizzflyId: Uuid,
    userId: Uuid,
    payload: ChangeThemeQuizzflyReqDto,
  ) {
    const quizzfly = await this.findById(quizzflyId);

    if (quizzfly.userId !== userId) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }

    quizzfly.theme = payload.theme;
    await this.quizzflyRepository.save(quizzfly);

    if (payload.applyToAll) {
      await Promise.all([
        this.eventService.emitAsync(
          new UpdateManyQuizEvent({
            quizzflyId,
            dto: { backgroundUrl: payload.theme },
          }),
        ),
        this.eventService.emitAsync(
          new UpdateManySlideEvent({
            quizzflyId,
            dto: { backgroundUrl: payload.theme },
          }),
        ),
      ]);
    }

    return plainToInstance(QuizzflyResDto, quizzfly, {
      excludeExtraneousValues: true,
    });
  }

  @OnEvent(`${QuizzflyScope}.${QuizzflyAction.getQuestions}`)
  async getQuestionsByQuizzflyId(payload: { quizzflyId: Uuid; userId: Uuid }) {
    const { quizzflyId, userId } = payload;
    const quizzfly = await this.findById(quizzflyId);
    if (quizzfly.userId !== userId) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }

    const questions =
      await this.quizzflyRepository.getQuestionsByQuizzflyId(quizzflyId);

    return this.orderedQuestions(questions);
  }

  async getLastQuestion(quizzflyId: Uuid) {
    const questions =
      await this.quizzflyRepository.getQuestionsByQuizzflyId(quizzflyId);
    const orderedQuestions = await this.orderedQuestions(questions);
    if (Array.isArray(orderedQuestions) && orderedQuestions.length > 0) {
      return orderedQuestions[orderedQuestions.length - 1];
    }
    return null;
  }

  async orderedQuestions(questions: any) {
    const questionMap = new Map<any, any>();
    const firstQuestionIndex = questions.findIndex(
      (question: any) => question.prevElementId === null,
    );
    const firstQuestion = questions[firstQuestionIndex];

    questions.splice(firstQuestionIndex, 1);
    questions.forEach((question: any) => {
      questionMap.set(question.prevElementId, question);
    });

    const orderedQuestions: any[] = [];
    let currentQuestion = firstQuestion;

    while (currentQuestion) {
      orderedQuestions.push(currentQuestion);
      currentQuestion = questionMap.get(currentQuestion.id);
    }
    return orderedQuestions;
  }

  async getBehindQuestion(quizzflyId: Uuid, currentItemId: Uuid) {
    return this.quizzflyRepository.getBehindQuestion(quizzflyId, currentItemId);
  }

  async deleteOne(quizzflyId: Uuid, userId: Uuid) {
    const quizzfly = await this.findById(quizzflyId);

    if (quizzfly.userId !== userId) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }

    await this.quizzflyRepository.softDelete({ id: quizzflyId });
  }

  async deleteQuizzfly(quizzflyId: Uuid) {
    const quizzfly = await this.findById(quizzflyId);
    if (quizzfly.deletedAt === null) {
      await this.quizzflyRepository.softDelete({ id: quizzflyId });
    }
  }

  async restoreQuizzfly(quizzflyId: Uuid) {
    const quizzfly = await this.quizzflyRepository.findOne({
      where: {
        id: quizzflyId,
      },
      withDeleted: true,
    });
    if (quizzfly.deletedAt !== null) {
      quizzfly.deletedAt = null;
      await this.quizzflyRepository.save(quizzfly);
    }
  }

  async publicQuizzfly(quizzflyId: Uuid) {
    const quizzfly = await this.findById(quizzflyId);
    if (quizzfly.isPublic === false) {
      quizzfly.isPublic = true;
      await this.quizzflyRepository.save(quizzfly);
    }
  }

  async unpublicQuizzfly(quizzflyId: Uuid) {
    const quizzfly = await this.findById(quizzflyId);
    if (quizzfly.isPublic === true) {
      quizzfly.isPublic = false;
      await this.quizzflyRepository.save(quizzfly);
    }
  }

  @Transactional()
  async changePositionQuestions(
    quizzflyId: Uuid,
    userId: Uuid,
    dto: ChangePositionQuestionReqDto,
  ) {
    const quizzfly = await this.findById(quizzflyId);
    if (quizzfly.userId !== userId) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }

    let firstQuestion: any, secondQuestion: any;

    if (dto.firstQuestionType === QuizzflyContentType.QUIZ) {
      firstQuestion = await this.eventService.emitAsync(
        new GetQuizEntityEvent(dto.firstQuestionId),
      );
    } else {
      firstQuestion = await this.eventService.emitAsync(
        new GetSlideEntityEvent(dto.firstQuestionId),
      );
    }

    if (dto.secondQuestionType === QuizzflyContentType.QUIZ) {
      secondQuestion = await this.eventService.emitAsync(
        new GetQuizEntityEvent(dto.secondQuestionId),
      );
    } else {
      secondQuestion = await this.eventService.emitAsync(
        new GetSlideEntityEvent(dto.secondQuestionId),
      );
    }
    const previousFirstQuestion = firstQuestion.prevElementId;
    const previousSecondQuestion = secondQuestion.prevElementId;

    const behindFirstQuestion = await this.getBehindQuestion(
      quizzflyId,
      dto.firstQuestionId,
    );
    const behindSecondQuestion = await this.getBehindQuestion(
      quizzflyId,
      dto.secondQuestionId,
    );

    if (this.areAdjacent(firstQuestion, secondQuestion)) {
      await this.swapAdjacentQuestions(
        firstQuestion,
        secondQuestion,
        behindFirstQuestion,
        behindSecondQuestion,
        dto,
      );
    } else {
      if (dto.firstQuestionIndex > dto.secondQuestionIndex) {
        if (behindFirstQuestion) {
          await this.updatePrevQuestion(
            behindFirstQuestion.id,
            previousFirstQuestion,
            behindFirstQuestion.type,
          );
        }
        await this.updatePrevQuestion(
          firstQuestion.id,
          previousSecondQuestion,
          dto.firstQuestionType,
        );
        await this.updatePrevQuestion(
          secondQuestion.id,
          firstQuestion.id,
          dto.secondQuestionType,
        );
      } else {
        if (behindFirstQuestion) {
          await this.updatePrevQuestion(
            behindFirstQuestion.id,
            previousFirstQuestion,
            behindFirstQuestion.type,
          );
        }
        if (behindSecondQuestion) {
          await this.updatePrevQuestion(
            behindSecondQuestion.id,
            firstQuestion.id,
            behindSecondQuestion.type,
          );
        }
        await this.updatePrevQuestion(
          firstQuestion.id,
          secondQuestion.id,
          dto.firstQuestionType,
        );
      }
    }
  }

  private areAdjacent(firstQuestion: any, secondQuestion: any) {
    return (
      firstQuestion.prevElementId === secondQuestion.id ||
      secondQuestion.prevElementId === firstQuestion.id
    );
  }

  private async swapAdjacentQuestions(
    firstQuestion: any,
    secondQuestion: any,
    behindFirstQuestion: any,
    behindSecondQuestion: any,
    dto: ChangePositionQuestionReqDto,
  ) {
    if (firstQuestion.prevElementId === secondQuestion.id) {
      await this.updatePrevQuestion(
        firstQuestion.id,
        secondQuestion.prevElementId,
        dto.firstQuestionType,
      );
      await this.updatePrevQuestion(
        secondQuestion.id,
        firstQuestion.id,
        dto.secondQuestionType,
      );

      if (behindFirstQuestion) {
        await this.updatePrevQuestion(
          behindFirstQuestion.id,
          secondQuestion.id,
          behindFirstQuestion.type,
        );
      }
    } else {
      await this.updatePrevQuestion(
        firstQuestion.id,
        secondQuestion.id,
        dto.firstQuestionType,
      );
      await this.updatePrevQuestion(
        secondQuestion.id,
        firstQuestion.prevElementId,
        dto.secondQuestionType,
      );

      if (behindSecondQuestion) {
        await this.updatePrevQuestion(
          behindSecondQuestion.id,
          firstQuestion.id,
          behindSecondQuestion.type,
        );
      }
    }
  }

  private async updatePrevQuestion(
    questionId: any,
    newPrevElementId: string | null,
    questionType: any,
  ) {
    if (questionType === QuizzflyContentType.QUIZ) {
      await this.eventService.emitAsync(
        new UpdatePositionQuizEvent({
          quizId: questionId,
          prevElementId: newPrevElementId as Uuid,
        }),
      );
    } else {
      await this.eventService.emitAsync(
        new UpdatePositionSlideEvent({
          slideId: questionId,
          prevElementId: newPrevElementId as Uuid,
        }),
      );
    }
  }
}
