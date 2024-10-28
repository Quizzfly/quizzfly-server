import { OffsetPaginationDto } from '@common/dto/offset-pagination/offset-pagination.dto';
import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@common/types/common.type';
import { ErrorCode } from '@core/constants/error-code.constant';
import { Optional } from '@core/utils/optional';
import { ChangePositionQuestionReqDto } from '@modules/quizzfly/dto/request/change-position-question.req';
import { ChangeThemeQuizzflyReqDto } from '@modules/quizzfly/dto/request/change-theme-quizzfly.req';
import { QueryQuizzflyReqDto } from '@modules/quizzfly/dto/request/query-quizzfly.req.dto';
import { SettingQuizzflyReqDto } from '@modules/quizzfly/dto/request/setting-quizzfly.req';
import { InfoDetailQuizzflyResDto } from '@modules/quizzfly/dto/response/info-detail-quizzfly.res';
import { InfoQuizzflyResDto } from '@modules/quizzfly/dto/response/info-quizzfly.res';
import { QuizzflyStatus } from '@modules/quizzfly/entity/enums/quizzfly-status.enum';
import { QuizzflyEntity } from '@modules/quizzfly/entity/quizzfly.entity';
import { PrevElementType } from '@modules/quizzfly/enums/prev-element-type.enum';
import { QuizzflyRepository } from '@modules/quizzfly/repository/quizzfly.repository';
import { UserService } from '@modules/user/user.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class QuizzflyService {
  constructor(
    private readonly quizzflyRepository: QuizzflyRepository,
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Transactional()
  async createDraftQuizzfly(userId: Uuid) {
    const draftQuizzfly = new QuizzflyEntity();
    draftQuizzfly.isPublic = true;
    draftQuizzfly.quizzflyStatus = QuizzflyStatus.Draft;
    draftQuizzfly.user = await this.userService.findByUserId(userId);

    await this.quizzflyRepository.save(draftQuizzfly);
    return InfoQuizzflyResDto.toInfoQuizzflyResponse(
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
      throw new ForbiddenException(ErrorCode.A009);
    }

    quizzfly.title = dto.title;
    quizzfly.description = dto.description;
    quizzfly.isPublic = dto.is_public;
    quizzfly.coverImage = dto.cover_image;
    await this.quizzflyRepository.save(quizzfly);

    return quizzfly.toDto(InfoDetailQuizzflyResDto);
  }

  async getMyQuizzfly(userId: Uuid, filterOptions: QueryQuizzflyReqDto) {
    const quizzflys = await this.quizzflyRepository.getMyQuizzfly(
      userId,
      filterOptions,
    );
    const user = await this.userService.findByUserId(userId);

    const items = quizzflys.map((quizzfly) =>
      InfoQuizzflyResDto.toInfoQuizzflyResponse(quizzfly, user),
    );
    const totalRecords = await this.quizzflyRepository.countBy({ userId });
    const meta = new OffsetPaginationDto(
      totalRecords,
      filterOptions as PageOptionsDto,
    );

    return new OffsetPaginatedDto(items, meta);
  }

  async findById(quizzflyId: Uuid) {
    return Optional.of(
      await this.quizzflyRepository.findOne({
        where: { id: quizzflyId },
        relations: ['user'],
      }),
    )
      .throwIfNotPresent(new NotFoundException(ErrorCode.E004))
      .get();
  }

  async getDetailQuizzfly(quizzflyId: Uuid) {
    const quizzfly = await this.findById(quizzflyId);
    return quizzfly.toDto(InfoDetailQuizzflyResDto);
  }

  async changeThemeQuizzfly(
    quizzflyId: Uuid,
    userId: Uuid,
    dto: ChangeThemeQuizzflyReqDto,
  ) {
    const quizzfly = await this.findById(quizzflyId);

    if (quizzfly.userId !== userId) {
      throw new ForbiddenException(ErrorCode.A009);
    }

    quizzfly.theme = dto.theme;
    await this.quizzflyRepository.save(quizzfly);
    return quizzfly.toDto(InfoDetailQuizzflyResDto);
  }

  async getQuestionsByQuizzflyId(quizzflyId: Uuid, userId: Uuid) {
    const quizzfly = await this.findById(quizzflyId);
    if (quizzfly.userId !== userId) {
      throw new ForbiddenException(ErrorCode.A009);
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
    questions.forEach((question: any) => {
      questionMap.set(question.prev_element_id, question);
    });
    const firstQuestion = questions.find(
      (question: any) => question.prev_element_id === null,
    );

    const orderedQuestions: any[] = [];
    let currentQuestion = firstQuestion;

    while (currentQuestion) {
      orderedQuestions.push(currentQuestion);
      currentQuestion = questionMap.get(currentQuestion.id);
    }
    return orderedQuestions.length > 0 ? orderedQuestions : questions;
  }

  async getBehindQuestion(quizzflyId: Uuid, currentItemId: Uuid) {
    return this.quizzflyRepository.getBehindQuestion(quizzflyId, currentItemId);
  }

  async deleteOne(quizzflyId: Uuid, userId: Uuid) {
    const quizzfly = await this.findById(quizzflyId);

    if (quizzfly.userId !== userId) {
      throw new ForbiddenException(ErrorCode.A009);
    }

    await this.quizzflyRepository.softDelete({ id: quizzflyId });
  }

  @Transactional()
  async changePositionQuestions(
    quizzflyId: Uuid,
    userId: Uuid,
    dto: ChangePositionQuestionReqDto,
  ) {
    const quizzfly = await this.findById(quizzflyId);
    if (quizzfly.userId !== userId) {
      throw new ForbiddenException(ErrorCode.A009);
    }

    let firstQuestion,
      behindFirstQuestion,
      secondQuestion,
      behindSecondQuestion,
      previousFirstQuestion,
      previouseSecondQuestion;

    if (dto.firstQuestionType === PrevElementType.QUIZ) {
      [firstQuestion] = await this.eventEmitter.emitAsync(
        'get.quiz.entity',
        dto.firstQuestionId,
      );
    } else {
      [firstQuestion] = await this.eventEmitter.emitAsync(
        'get.slide.entity',
        dto.firstQuestionId,
      );
    }

    if (dto.secondQuestionType === PrevElementType.QUIZ) {
      [secondQuestion] = await this.eventEmitter.emitAsync(
        'get.quiz.entity',
        dto.secondQuestionId,
      );
    } else {
      [secondQuestion] = await this.eventEmitter.emitAsync(
        'get.slide.entity',
        dto.secondQuestionId,
      );
    }
    previousFirstQuestion = firstQuestion.prevElementId;
    previouseSecondQuestion = secondQuestion.prevElementId;

    behindFirstQuestion = await this.getBehindQuestion(
      quizzflyId,
      dto.firstQuestionId,
    );
    behindSecondQuestion = await this.getBehindQuestion(
      quizzflyId,
      dto.secondQuestionId,
    );

    if (firstQuestion.prevElementId === secondQuestion.id) {
      await this.updatePrevQuestion(firstQuestion.id, previouseSecondQuestion, dto.firstQuestionType);
      await this.updatePrevQuestion(secondQuestion.id, firstQuestion.id, dto.secondQuestionType);

      if (behindFirstQuestion) {
        await this.updatePrevQuestion(behindFirstQuestion.id, secondQuestion.id, behindFirstQuestion.type);
      }
    } else if (secondQuestion.prevElementId === firstQuestion.id) {
      await this.updatePrevQuestion(firstQuestion.id, secondQuestion.id, dto.firstQuestionType);
      await this.updatePrevQuestion(secondQuestion.id, previousFirstQuestion, dto.secondQuestionType);

      if (behindSecondQuestion) {
        await this.updatePrevQuestion(behindSecondQuestion.id, firstQuestion.id, behindSecondQuestion.type);
      }
    } else {
      if(dto.firstQuestionIndex > dto.secondQuestionIndex) {
        if(behindFirstQuestion) {
          await this.updatePrevQuestion(behindFirstQuestion.id, previousFirstQuestion, behindFirstQuestion.type);
        }
        await this.updatePrevQuestion(firstQuestion.id, previouseSecondQuestion, dto.firstQuestionType);
        await this.updatePrevQuestion(secondQuestion.id, firstQuestion.id, dto.secondQuestionType);
      } else {
         if(behindFirstQuestion) {
           await this.updatePrevQuestion(behindFirstQuestion.id, previousFirstQuestion, behindFirstQuestion.type);
         }
        if(behindSecondQuestion) {
          await this.updatePrevQuestion(behindSecondQuestion.id, firstQuestion.id, behindSecondQuestion.type);
        }
        await this.updatePrevQuestion(firstQuestion.id, secondQuestion.id, dto.firstQuestionType);
      }
    }
  }

  async updatePrevQuestion(
    questionId: any,
    newPrevElementId: string | null,
    questionType: any,
  ) {
    if (questionType === PrevElementType.QUIZ) {
      await this.eventEmitter.emitAsync('update.quiz.position', {
        quizId: questionId,
        prevElementId: newPrevElementId,
      });
    } else {
      await this.eventEmitter.emitAsync('update.slide.position', {
        slideId: questionId,
        prevElementId: newPrevElementId,
      });
    }
  }
}
