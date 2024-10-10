import { Uuid } from '@common/types/common.type';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { ApiAuth } from '@core/decorators/http.decorators';
import { SettingQuizzflyReqDto } from '@modules/quizzfly/dto/request/setting-quizzfly.request';
import { InfoDetailQuizzflyResDto } from '@modules/quizzfly/dto/response/info-detail-quizzfly.response';
import { InfoQuizzflyResDto } from '@modules/quizzfly/dto/response/info-quizzfly.response';
import { QuizzflyService } from '@modules/quizzfly/quizzfly.service';
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';

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

  @Put(':quizzflyId/settings')
  @ApiAuth({
    type: InfoDetailQuizzflyResDto,
    summary: 'Setting quizzfly',
  })
  @ApiParam({
    name: 'quizzflyId',
    description: 'The UUID of the Quizzfly',
    type: 'string',
  })
  async settingQuizzfly(
    @Param('quizzflyId') quizzflyId: Uuid,
    @CurrentUser('id') userId: Uuid,
    @Body() dto: SettingQuizzflyReqDto,
  ) {
    return this.quizzflyService.settingQuizzfly(userId, quizzflyId, dto);
  }

  @Get()
  @ApiAuth({
    summary: 'Get my quizzfly',
    type: InfoQuizzflyResDto,
    isArray: true,
  })
  async getMyQuizzfly(@CurrentUser('id') userId: Uuid) {
    return this.quizzflyService.getMyQuizzfly(userId);
  }
}
