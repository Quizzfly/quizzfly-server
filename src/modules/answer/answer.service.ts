import { Uuid } from '@common/types/common.type';
import { defaultInstanceEntity } from '@core/constants/app.constant';
import { Optional } from '@core/utils/optional';
import { CreateAnswerReqDto } from '@modules/answer/dto/request/create-answer.req.dto';
import { UpdateAnswerReqDto } from '@modules/answer/dto/request/update-answer.req.dto';
import { AnswerResDto } from '@modules/answer/dto/response/answer.res.dto';
import { AnswerEntity } from '@modules/answer/entities/answer.entity';
import { AnswerAction, AnswerScope } from '@modules/answer/events';
import { AnswerRepository } from '@modules/answer/repositories/answer.repository';
import { QuizService } from '@modules/quiz/quiz.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { plainToInstance } from 'class-transformer';
import { FindOptionsWhere, IsNull, Not } from 'typeorm';

@Injectable()
export class AnswerService {
  private readonly logger = new Logger(AnswerService.name);

  constructor(
    private readonly answerRepository: AnswerRepository,
    private readonly quizService: QuizService,
  ) {}

  async create(quizId: Uuid, dto: CreateAnswerReqDto) {
    await this.quizService.findOneById(quizId);

    const noAnswerOfQuiz = await this.answerRepository.countBy({
      quizId,
      index: Not(IsNull()),
    });

    const answer = new AnswerEntity(dto);
    answer.quizId = quizId;
    answer.index = noAnswerOfQuiz;
    await this.answerRepository.save(answer);

    return answer.toDto(AnswerResDto);
  }

  @OnEvent(`${AnswerScope}.${AnswerAction.insertMany}`)
  async insertMany(answers: AnswerEntity[]) {
    return this.answerRepository.save(answers);
  }

  async findOneById(answerId: Uuid) {
    const answer: AnswerEntity = Optional.of(
      await this.answerRepository.findOneBy({ id: answerId }),
    )
      .throwIfNullable(new NotFoundException('Answer is not found'))
      .get();

    return answer.toDto(AnswerResDto);
  }

  async findOneByCondition(filter: FindOptionsWhere<AnswerEntity> = {}) {
    return this.answerRepository.findOneBy(filter);
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

    if (dto.isCorrect) {
      await this.answerRepository.update(
        { quizId: answer.quizId as Uuid },
        { isCorrect: false },
      );
    }

    Object.assign(answer, dto);
    await this.answerRepository.save(answer);
    return answer;
  }

  async deleteOne(answerId: Uuid) {
    await this.findOneById(answerId);

    await this.answerRepository.softDelete({ id: answerId });
  }

  @OnEvent(`${AnswerScope}.${AnswerAction.duplicateAnswers}`)
  async addAnswerForDuplicateQuiz(dto: {
    quizId: Uuid;
    duplicateQuizId: Uuid;
  }) {
    const answers = await this.findAllByCondition({ quizId: dto.quizId });
    if (answers?.length > 0) {
      const items = answers.map((answer) => {
        return new AnswerEntity({
          ...answer,
          quizId: dto.duplicateQuizId,
          ...defaultInstanceEntity,
        });
      });
      return this.answerRepository.save(items);
    }
    return null;
  }
}
