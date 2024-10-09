import { Uuid } from '@common/types/common.type';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { ApiAuth } from '@core/decorators/http.decorators';
import { InfoQuizzflyResDto } from '@modules/quizzfly/dto/response/info-quizzfly.response';
import { QuizzflyService } from '@modules/quizzfly/quizzfly.service';
import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Quizzfly APIs')
@Controller({
  path: 'quizzfly',
  version: '1',
})
export class QuizzflyController {
  constructor(private readonly quizzflyService: QuizzflyService) {}

  @Post('drafts')
  @ApiAuth({
    type: InfoQuizzflyResDto,
    summary: 'Create a draft quizzfly',
  })
  async createDraftQuizzfly(@CurrentUser('id') userId: Uuid) {
    return this.quizzflyService.createDraftQuizzfly(userId);
  }
}
