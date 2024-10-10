import { Uuid } from '@common/types/common.type';
import { ErrorCode } from '@core/constants/error-code.constant';
import { Optional } from '@core/utils/optional';
import { SettingQuizzflyReqDto } from '@modules/quizzfly/dto/request/setting-quizzfly.request';
import { InfoDetailQuizzflyResDto } from '@modules/quizzfly/dto/response/info-detail-quizzfly.response';
import { InfoQuizzflyResDto } from '@modules/quizzfly/dto/response/info-quizzfly.response';
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
    quizzfly.isPublic = dto.isPublic;
    quizzfly.coverImage = dto.coverImage;
    await this.quizzflyRepository.save(quizzfly);

    return quizzfly.toDto(InfoDetailQuizzflyResDto);
  }

  async getMyQuizzfly(userId: Uuid) {
    const quizzflys = await this.quizzflyRepository.getMyQuizzfly(userId);
    const user = await this.userService.findByUserId(userId);

    return quizzflys.map((quizzfly) =>
      InfoQuizzflyResDto.toInfoQuizzflyResponse(quizzfly, user),
    );
  }

  async findById(quizzflyId: Uuid) {
    return Optional.of(
      await this.quizzflyRepository.findOne({
        where: { id: quizzflyId },
      }),
    )
      .throwIfNotPresent(new NotFoundException(ErrorCode.E004))
      .get();
  }
}
