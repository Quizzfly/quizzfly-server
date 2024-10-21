import { Uuid } from '@common/types/common.type';
import { ApiAuth } from '@core/decorators/http.decorators';
import { ValidateUuid } from '@core/decorators/validators/uuid-validator';
import { CreateQuizReqDto } from '@modules/quiz/dto/request/create-quiz.req.dto';
import { UpdateQuizReqDto } from '@modules/quiz/dto/request/update-quiz.req.dto';
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
  })
  @ApiParam({
    name: 'quizzflyId',
    description: 'The UUID of the Quizzfly',
    type: String,
  })
  @Post('quizzfly/:quizzflyId/quizzes')
  async createQuiz(
    @Param('quizzflyId', ValidateUuid) quizzflyId: Uuid,
    @Body() dto: CreateQuizReqDto,
  ) {
    return this.quizService.create(dto);
  }

  @ApiAuth({
    summary: 'Duplicate a quiz',
    statusCode: HttpStatus.CREATED,
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
    @Param('quizzflyId', ValidateUuid) quizzflyId: Uuid,
    @Param('quizId', ValidateUuid) quizId: Uuid,
  ) {}

  @ApiAuth({
    summary: 'Update a quiz',
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
    @Param('quizzflyId', ValidateUuid) quizzflyId: Uuid,
    @Param('quizId', ValidateUuid) quizId: Uuid,
    @Body() dto: UpdateQuizReqDto,
  ) {}

  @ApiAuth({
    summary: 'Setting a quiz',
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
    @Param('quizzflyId', ValidateUuid) quizzflyId: Uuid,
    @Param('quizId', ValidateUuid) quizId: Uuid,
    @Body() dto: UpdateQuizReqDto,
  ) {}

  @ApiAuth({
    summary: 'Setting a quiz',
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
    @Param('quizzflyId', ValidateUuid) quizzflyId: Uuid,
    @Param('quizId', ValidateUuid) quizId: Uuid,
    @Body() dto: UpdateQuizReqDto,
  ) {}
}
