import { Uuid } from '@common/types/common.type';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { ApiAuth, ApiPublic } from '@core/decorators/http.decorators';
import { ChangePositionQuestionReqDto } from '@modules/quizzfly/dto/request/change-position-question.req';
import { ChangeThemeQuizzflyReqDto } from '@modules/quizzfly/dto/request/change-theme-quizzfly.req';
import { QueryQuizzflyReqDto } from '@modules/quizzfly/dto/request/query-quizzfly.req.dto';
import { SettingQuizzflyReqDto } from '@modules/quizzfly/dto/request/setting-quizzfly.req';
import { InfoDetailQuizzflyResDto } from '@modules/quizzfly/dto/response/info-detail-quizzfly.res';
import { InfoQuizzflyResDto } from '@modules/quizzfly/dto/response/info-quizzfly.res';
import { QuizzflyService } from '@modules/quizzfly/quizzfly.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
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
    isPaginated: true,
    paginationType: 'offset',
  })
  async getMyQuizzfly(
    @CurrentUser('id') userId: Uuid,
    @Query() filterOptions: QueryQuizzflyReqDto,
  ) {
    return this.quizzflyService.getMyQuizzfly(userId, filterOptions);
  }

  @Get(':quizzflyId')
  @ApiPublic({
    summary: 'Get quizzfly by id',
    type: InfoQuizzflyResDto,
  })
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

  @Get(':quizzflyId/questions')
  @ApiAuth({
    summary: 'Get list question by quizzflyId',
  })
  @ApiParam({
    name: 'quizzflyId',
    description: 'The UUID of the Quizzfly',
    type: 'string',
  })
  async getQuestionsByQuizzflyId(
    @CurrentUser('id') userId: Uuid,
    @Param('quizzflyId') quizzflyId: Uuid,
  ) {
    return this.quizzflyService.getQuestionsByQuizzflyId(quizzflyId, userId);
  }

  @Delete(':quizzflyId')
  @ApiAuth({
    summary: 'Delete a quizzfly',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @ApiParam({
    name: 'quizzflyId',
    description: 'The UUID of the Quizzfly',
    type: 'string',
  })
  deleteQuizzfly(
    @CurrentUser('id') userId: Uuid,
    @Param('quizzflyId') quizzflyId: Uuid,
  ) {
    return this.quizzflyService.deleteOne(quizzflyId, userId);
  }

  @Put(':quizzflyId/questions/position')
  @ApiAuth({
    summary: 'Change position question',
  })
  @ApiParam({
    name: 'quizzflyId',
    description: 'The UUID of the Quizzfly',
    type: 'string',
  })
  async changePositionQuestion(
    @CurrentUser('id') userId: Uuid,
    @Param('quizzflyId') quizzflyId: Uuid,
    @Body() dto: ChangePositionQuestionReqDto,
  ) {
    return this.quizzflyService.changePositionQuestions(
      quizzflyId,
      userId,
      dto,
    );
  }
}
