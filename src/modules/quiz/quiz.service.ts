import { Uuid } from '@common/types/common.type';
import { ErrorCode } from '@core/constants/error-code.constant';
import { CreateQuizReqDto } from '@modules/quiz/dto/request/create-quiz.req.dto';
import { QuizResDto } from '@modules/quiz/dto/response/quiz.res.dto';
import { QuizEntity } from '@modules/quiz/entities/quiz.entity';
import { QuizRepository } from '@modules/quiz/repositories/quiz.repository';
import { QuizzflyService } from '@modules/quizzfly/quizzfly.service';
import { ForbiddenException, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly quizzflyService: QuizzflyService,
  ) {}

  async create(userId: Uuid, quizzflyId: Uuid, dto: CreateQuizReqDto) {
    const quizzfly = await this.quizzflyService.findById(quizzflyId);
    if (quizzfly.userId !== userId) {
      throw new ForbiddenException(ErrorCode.E004);
    }

    const quiz = new QuizEntity(dto);
    const lastItem = await this.quizzflyService.getLastItem(quizzflyId);
    if (lastItem) {
      quiz.prevElementId = lastItem.id;
    }
    await quiz.save();
    return quiz.toDto(QuizResDto);
  }
}
