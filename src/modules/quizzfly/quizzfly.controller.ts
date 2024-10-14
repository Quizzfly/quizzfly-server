import { Uuid } from '@common/types/common.type';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { ApiAuth, ApiPublic } from '@core/decorators/http.decorators';
import { ChangeThemeQuizzflyReqDto } from '@modules/quizzfly/dto/request/change-theme-quizzfly.req';
import { SettingQuizzflyReqDto } from '@modules/quizzfly/dto/request/setting-quizzfly.req';
import { InfoDetailQuizzflyResDto } from '@modules/quizzfly/dto/response/info-detail-quizzfly.res';
import { InfoQuizzflyResDto } from '@modules/quizzfly/dto/response/info-quizzfly.res';
import { QuizzflyService } from '@modules/quizzfly/quizzfly.service';
import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
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

  @Get(':quizzflyId')
  @ApiPublic()
  @ApiParam({
    name: 'quizzflyId',
    description: 'The UUID of the Quizzfly',
    type: 'string',
  })
  async getDetailQuizzfly(@Param('quizzflyId') quizzflyId: Uuid) {
    return this.quizzflyService.getDetailQuizzfly(quizzflyId);
  }

  @Patch(':quizzflyId/themes')
  @ApiAuth({
    type: InfoDetailQuizzflyResDto,
    summary: 'Update theme quizzfly',
  })
  @ApiParam({
    name: 'quizzflyId',
    description: 'The UUID of the Quizzfly',
    type: 'string',
  })
  async changeTheme(
    @CurrentUser('id') userId: Uuid,
    @Param('quizzflyId') quizzflyId: Uuid,
    @Body() dto: ChangeThemeQuizzflyReqDto,
  ) {
    return this.quizzflyService.changeThemeQuizzfly(quizzflyId, userId, dto);
  }
}
