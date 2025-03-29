import { Uuid } from '@common/types/common.type';
import { ActionList, ResourceList } from '@core/constants/app.constant';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { ApiAuth } from '@core/decorators/http.decorators';
import { ValidateUuid } from '@core/decorators/validators/uuid-validator';
import { PermissionGuard } from '@core/guards/permission.guard';
import { CreateMultipleQuizGeneratedReqDto } from '@modules/quiz/dto/request/create-multiple-quiz-generated.req.dto';
import { CreateQuizReqDto } from '@modules/quiz/dto/request/create-quiz.req.dto';
import { GenerateQuizByAiReqDto } from '@modules/quiz/dto/request/generate-quiz-by-ai.req.dto';
import { SettingQuizReqDto } from '@modules/quiz/dto/request/setting-quiz.req.dto';
import { UpdateQuizReqDto } from '@modules/quiz/dto/request/update-quiz.req.dto';
import { QuizResDto } from '@modules/quiz/dto/response/quiz.res.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { QuizService } from './quiz.service';

@Controller({ version: '1' })
@ApiTags('Quiz APIs')
@UseGuards(PermissionGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @ApiAuth({
    summary: 'Create a quiz for a quizzfly',
    statusCode: HttpStatus.CREATED,
    type: QuizResDto,
    permissions: [
      { resource: ResourceList.QUIZZFLY, actions: [ActionList.UPDATE] },
    ],
  })
  @ApiParam({
    name: 'quizzflyId',
    description: 'The UUID of the Quizzfly',
    type: String,
  })
  @Post('quizzfly/:quizzflyId/quizzes')
  async createQuiz(
    @CurrentUser('id') userId: Uuid,
    @Param('quizzflyId', ValidateUuid) quizzflyId: Uuid,
    @Body() dto: CreateQuizReqDto,
  ) {
    return this.quizService.create(userId, quizzflyId, dto);
  }

  @ApiAuth({
    summary: 'Create a batch quiz for a quizzfly',
    statusCode: HttpStatus.CREATED,
    type: QuizResDto,
    isArray: true,
    permissions: [
      { resource: ResourceList.QUIZZFLY, actions: [ActionList.UPDATE] },
    ],
  })
  @ApiParam({
    name: 'quizzflyId',
    description: 'The UUID of the Quizzfly',
    type: String,
  })
  @Post('quizzfly/:quizzflyId/quizzes/batch')
  async createBatchQuiz(
    @CurrentUser('id') userId: Uuid,
    @Param('quizzflyId', ValidateUuid) quizzflyId: Uuid,
    @Body() dto: CreateMultipleQuizGeneratedReqDto,
  ) {
    return this.quizService.createBatch(userId, quizzflyId, dto);
  }

  @ApiAuth({
    summary: 'Duplicate a quiz',
    statusCode: HttpStatus.CREATED,
    type: QuizResDto,
    permissions: [
      { resource: ResourceList.QUIZZFLY, actions: [ActionList.UPDATE] },
    ],
  })
  @ApiParam({
    name: 'quizzflyId',
    description: 'The UUID of the Quizzfly',
    type: String,
  })
  @ApiParam({
    name: 'quizId',
    description: 'The UUID of the Quiz',
    type: String,
  })
  @Post('quizzfly/:quizzflyId/quizzes/:quizId/duplicate')
  async duplicateQuiz(
    @CurrentUser('id') userId: Uuid,
    @Param('quizzflyId', ValidateUuid) quizzflyId: Uuid,
    @Param('quizId', ValidateUuid) quizId: Uuid,
  ) {
    return this.quizService.duplicateQuiz(quizzflyId, quizId, userId);
  }

  @ApiAuth({
    summary: 'Find a quiz',
    type: QuizResDto,
    permissions: [
      { resource: ResourceList.QUIZZFLY, actions: [ActionList.READ] },
    ],
  })
  @ApiParam({
    name: 'quizId',
    description: 'The UUID of the Quiz',
    type: String,
  })
  @Get('quizzfly/quizzes/:quizId')
  findQuiz(@Param('quizId') quizId: Uuid) {
    return this.quizService.findOneById(quizId);
  }

  @ApiAuth({
    summary: 'Update a quiz',
    type: QuizResDto,
    permissions: [
      { resource: ResourceList.QUIZZFLY, actions: [ActionList.UPDATE] },
    ],
  })
  @ApiParam({
    name: 'quizzflyId',
    description: 'The UUID of the Quizzfly',
    type: String,
  })
  @ApiParam({
    name: 'quizId',
    description: 'The UUID of the Quiz',
    type: String,
  })
  @Put('quizzfly/:quizzflyId/quizzes/:quizId')
  updateQuiz(
    @CurrentUser('id') userId: Uuid,
    @Param('quizzflyId', ValidateUuid) quizzflyId: Uuid,
    @Param('quizId', ValidateUuid) quizId: Uuid,
    @Body() dto: UpdateQuizReqDto,
  ) {
    return this.quizService.updateOne(quizzflyId, quizId, userId, dto);
  }

  @ApiAuth({
    summary: 'Setting a quiz',
    type: QuizResDto,
    permissions: [
      { resource: ResourceList.QUIZZFLY, actions: [ActionList.UPDATE] },
    ],
  })
  @ApiParam({
    name: 'quizzflyId',
    description: 'The UUID of the Quizzfly',
    type: String,
  })
  @ApiParam({
    name: 'quizId',
    description: 'The UUID of the Quiz',
    type: String,
  })
  @Put('quizzfly/:quizzflyId/quizzes/:quizId/settings')
  settingQuiz(
    @CurrentUser('id') userId: Uuid,
    @Param('quizzflyId', ValidateUuid) quizzflyId: Uuid,
    @Param('quizId', ValidateUuid) quizId: Uuid,
    @Body() dto: SettingQuizReqDto,
  ) {
    return this.quizService.updateOne(quizzflyId, quizId, userId, dto);
  }

  @ApiAuth({
    summary: 'Delete a quiz',
    statusCode: HttpStatus.NO_CONTENT,
    permissions: [
      { resource: ResourceList.QUIZZFLY, actions: [ActionList.DELETE] },
    ],
  })
  @ApiParam({
    name: 'quizzflyId',
    description: 'The UUID of the Quizzfly',
    type: String,
  })
  @ApiParam({
    name: 'quizId',
    description: 'The UUID of the Quiz',
    type: String,
  })
  @Delete('quizzfly/:quizzflyId/quizzes/:quizId')
  deleteQuiz(
    @CurrentUser('id') userId: Uuid,
    @Param('quizzflyId', ValidateUuid) quizzflyId: Uuid,
    @Param('quizId', ValidateUuid) quizId: Uuid,
  ) {
    return this.quizService.deleteOne(quizzflyId, quizId, userId);
  }

  @ApiAuth({
    summary: 'Generate quizzes by AI',
  })
  @Post('quizzfly/quizzes/generate-by-ai')
  async generateQuizByAI(
    @CurrentUser('id') userId: Uuid,
    @Body() dto: GenerateQuizByAiReqDto,
  ) {
    return this.quizService.generateQuizByAI(userId, dto);
  }
}
