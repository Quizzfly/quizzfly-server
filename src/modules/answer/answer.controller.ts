import { Uuid } from '@common/types/common.type';
import { ActionList, ResourceList } from '@core/constants/app.constant';
import { ApiAuth } from '@core/decorators/http.decorators';
import { ValidateUuid } from '@core/decorators/validators/uuid-validator';
import { PermissionGuard } from '@core/guards/permission.guard';
import { CreateAnswerReqDto } from '@modules/answer/dto/request/create-answer.req.dto';
import { UpdateAnswerReqDto } from '@modules/answer/dto/request/update-answer.req.dto';
import { AnswerResDto } from '@modules/answer/dto/response/answer.res.dto';
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
import { AnswerService } from './answer.service';

@ApiTags('Answer APIs')
@Controller({ version: '1' })
@UseGuards(PermissionGuard)
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @ApiAuth({
    summary: 'Create a answer for a quiz',
    statusCode: HttpStatus.CREATED,
    type: AnswerResDto,
    permissions: [
      { resource: ResourceList.QUIZZFLY, actions: [ActionList.CREATE] },
    ],
  })
  @ApiParam({
    name: 'quizId',
    description: 'The UUID of the Quiz',
  })
  @Post('quizzes/:quizId/answers')
  createAnswer(
    @Param('quizId', ValidateUuid) quizId: Uuid,
    @Body() dto: CreateAnswerReqDto,
  ) {
    return this.answerService.create(quizId, dto);
  }

  @ApiAuth({
    summary: 'Get a answer',
    type: AnswerResDto,
    permissions: [
      { resource: ResourceList.QUIZZFLY, actions: [ActionList.READ] },
    ],
  })
  @ApiParam({
    name: 'answerId',
    description: 'The UUID of the Answer',
  })
  @Get('quizzes/answers/:answerId')
  findAnswer(@Param('answerId', ValidateUuid) answerId: Uuid) {
    return this.answerService.findOneById(answerId);
  }

  @ApiAuth({
    summary: 'Get answers by quiz id',
    type: AnswerResDto,
    isArray: true,
    permissions: [
      { resource: ResourceList.QUIZZFLY, actions: [ActionList.READ] },
    ],
  })
  @ApiParam({
    name: 'quizId',
    description: 'The UUID of the Quiz',
  })
  @Get('quizzes/:quizId/answers')
  findAnswersByQuizId(@Param('quizId', ValidateUuid) quizId: Uuid) {
    return this.answerService.findAllByCondition({ quizId });
  }

  @ApiAuth({
    summary: 'Update a answer',
    type: AnswerResDto,
    permissions: [
      { resource: ResourceList.QUIZZFLY, actions: [ActionList.UPDATE] },
    ],
  })
  @ApiParam({
    name: 'answerId',
    description: 'The UUID of the Answer',
  })
  @Put('quizzes/answers/:answerId')
  updateAnswer(
    @Param('answerId', ValidateUuid) answerId: Uuid,
    @Body() dto: UpdateAnswerReqDto,
  ) {
    return this.answerService.updateOne(answerId, dto);
  }

  @ApiAuth({
    summary: 'Delete a answer',
    statusCode: HttpStatus.NO_CONTENT,
    permissions: [
      { resource: ResourceList.QUIZZFLY, actions: [ActionList.DELETE] },
    ],
  })
  @ApiParam({
    name: 'answerId',
    description: 'The UUID of the Answer',
    type: 'string',
  })
  @Delete('quizzes/answers/:answerId')
  deleteAnswer(@Param('answerId', ValidateUuid) answerId: Uuid) {
    return this.answerService.deleteOne(answerId);
  }
}
