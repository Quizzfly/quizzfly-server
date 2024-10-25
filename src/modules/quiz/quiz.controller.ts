import { Uuid } from '@common/types/common.type';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { ApiAuth } from '@core/decorators/http.decorators';
import { ValidateUuid } from '@core/decorators/validators/uuid-validator';
import { CreateQuizReqDto } from '@modules/quiz/dto/request/create-quiz.req.dto';
import { SettingQuizReqDto } from '@modules/quiz/dto/request/setting-quiz.req.dto';
import { UpdateQuizReqDto } from '@modules/quiz/dto/request/update-quiz.req.dto';
import { QuizResDto } from '@modules/quiz/dto/response/quiz.res.dto';
import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { QuizService } from './quiz.service';

@Controller({ version: '1' })
@ApiTags('Quiz APIs')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @ApiAuth({
    summary: 'Create a quiz for a quizzfly',
    statusCode: HttpStatus.CREATED,
    type: QuizResDto,
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
    summary: 'Duplicate a quiz',
    statusCode: HttpStatus.CREATED,
    type: QuizResDto,
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
    summary: 'Update a quiz',
    type: QuizResDto,
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
}
