import { Uuid } from '@common/types/common.type';
import { InfoQuizzflyResDto } from '@modules/quizzfly/dto/response/info-quizzfly.response';
import { QuizzflyStatus } from '@modules/quizzfly/entity/enums/quizzfly-status.enum';
import { QuizzflyEntity } from '@modules/quizzfly/entity/quizzfly.entity';
import { QuizzflyRepository } from '@modules/quizzfly/repository/quizzfly.repository';
import { UserService } from '@modules/user/user.service';
import { Injectable } from '@nestjs/common';
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
}
