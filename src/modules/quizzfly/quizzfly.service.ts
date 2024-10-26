import { OffsetPaginationDto } from '@common/dto/offset-pagination/offset-pagination.dto';
import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@common/types/common.type';
import { ErrorCode } from '@core/constants/error-code.constant';
import { Optional } from '@core/utils/optional';
import { ChangeThemeQuizzflyReqDto } from '@modules/quizzfly/dto/request/change-theme-quizzfly.req';
import { QueryQuizzflyReqDto } from '@modules/quizzfly/dto/request/query-quizzfly.req.dto';
import { SettingQuizzflyReqDto } from '@modules/quizzfly/dto/request/setting-quizzfly.req';
import { InfoDetailQuizzflyResDto } from '@modules/quizzfly/dto/response/info-detail-quizzfly.res';
import { InfoQuizzflyResDto } from '@modules/quizzfly/dto/response/info-quizzfly.res';
import { QuizzflyStatus } from '@modules/quizzfly/entity/enums/quizzfly-status.enum';
import { QuizzflyEntity } from '@modules/quizzfly/entity/quizzfly.entity';
import { QuizzflyRepository } from '@modules/quizzfly/repository/quizzfly.repository';
import { UserService } from '@modules/user/user.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class QuizzflyService {
  constructor(
    private readonly quizzflyRepository: QuizzflyRepository,
    private readonly userService: UserService,
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

    return orderedQuestions.length === questions.length
      ? orderedQuestions
      : questions;
  }

  async getLastQuestion(quizzflyId: Uuid) {
    return this.quizzflyRepository.getLastQuestion(quizzflyId);
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
}
