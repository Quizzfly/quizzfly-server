import { Uuid } from '@common/types/common.type';
import { Optional } from '@core/utils/optional';
import { CreateAnswerReqDto } from '@modules/answer/dto/request/create-answer.req.dto';
import { UpdateAnswerReqDto } from '@modules/answer/dto/request/update-answer.req.dto';
import { AnswerResDto } from '@modules/answer/dto/response/answer.res.dto';
import { AnswerEntity } from '@modules/answer/entities/answer.entity';
import { AnswerRepository } from '@modules/answer/repositories/answer.repository';
import { QuizService } from '@modules/quiz/quiz.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { FindOptionsWhere } from 'typeorm';

@Injectable()
export class AnswerService {
  private readonly logger = new Logger(AnswerService.name);

  constructor(
    private readonly answerRepository: AnswerRepository,
    private readonly quizService: QuizService,
  ) {}

  async create(quizId: Uuid, dto: CreateAnswerReqDto) {
    await this.quizService.findOneById(quizId);

    const answer = new AnswerEntity(dto);
    answer.quizId = quizId;
    await this.answerRepository.save(answer);

    return answer.toDto(AnswerResDto);
  }

  async findOneById(answerId: Uuid) {
    const answer: AnswerEntity = Optional.of(
      await this.answerRepository.findOneBy({ id: answerId }),
    )
      .throwIfNullable(new NotFoundException('Answer is not found'))
      .get();

    return answer.toDto(AnswerResDto);
  }

  async findAllByCondition(filter: FindOptionsWhere<AnswerEntity> = {}) {
    if (filter.quizId) {
      await this.quizService.findOneById(filter.quizId as Uuid);
    }

    const answers = await this.answerRepository.findBy(filter);

    return plainToInstance(AnswerResDto, answers);
  }

  async updateOne(answerId: Uuid, dto: UpdateAnswerReqDto) {
    const answer = await this.findOneById(answerId);
    Object.assign(answer, dto);
    await this.answerRepository.save(answer);

    return answer;
  }

  async deleteOne(answerId: Uuid) {
    await this.findOneById(answerId);

    await this.answerRepository.softDelete({ id: answerId });
  }
}
