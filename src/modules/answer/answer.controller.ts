import { Uuid } from '@common/types/common.type';
import { ApiAuth } from '@core/decorators/http.decorators';
import { CreateAnswerReqDto } from '@modules/answer/dto/request/create-answer.req.dto';
import { UpdateAnswerReqDto } from '@modules/answer/dto/request/update-answer.req.dto';
import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { AnswerService } from './answer.service';

@ApiTags('Answer APIs')
@Controller({ version: '1' })
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @ApiAuth({
    summary: 'Create a answer for a quiz',
  })
  @ApiParam({
    name: 'quizId',
    description: 'The UUID of the Quiz',
  })
  @Post('quizzes/:quizId/answers')
  async createAnswer(
    @Param('quizId') quizId: Uuid,
    @Body() dto: CreateAnswerReqDto,
  ) {}

  @ApiAuth({
    summary: 'Update a answer',
  })
  @ApiParam({
    name: 'answerId',
    description: 'The UUID of the Answer',
  })
  @Put('quizzes/answers/:answerId')
  async updateAnswer(
    @Param('answerId') answerId: Uuid,
    @Body() dto: UpdateAnswerReqDto,
  ) {}
}
