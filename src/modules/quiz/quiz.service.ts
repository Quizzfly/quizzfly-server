import { Uuid } from '@common/types/common.type';
import { defaultInstanceEntity } from '@core/constants/app.constant';
import { ErrorCode } from '@core/constants/error-code.constant';
import { Optional } from '@core/utils/optional';
import { CreateQuizReqDto } from '@modules/quiz/dto/request/create-quiz.req.dto';
import { QuizResDto } from '@modules/quiz/dto/response/quiz.res.dto';
import { QuizEntity } from '@modules/quiz/entities/quiz.entity';
import { QuizRepository } from '@modules/quiz/repositories/quiz.repository';
import { PrevElementType } from '@modules/quizzfly/enums/prev-element-type.enum';
import { QuizzflyService } from '@modules/quizzfly/quizzfly.service';
import { SlideService } from '@modules/slide/slide.service';
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly quizzflyService: QuizzflyService,
    // @Inject(forwardRef(() => SlideService))
    private readonly slideService: SlideService,
  ) {}

  @Transactional()
  async create(userId: Uuid, quizzflyId: Uuid, dto: CreateQuizReqDto) {
    const quizzfly = await this.quizzflyService.findById(quizzflyId);
    if (quizzfly.userId !== userId) {
      throw new ForbiddenException(ErrorCode.E004);
    }

    const currentLastQuestion =
      await this.quizzflyService.getLastQuestion(quizzflyId);

    const quiz = new QuizEntity(dto);
    quiz.quizzflyId = quizzflyId;
    quiz.prevElementId = currentLastQuestion ? currentLastQuestion.id : null;
    await this.quizRepository.save(quiz);

    return quiz.toDto(QuizResDto);
  }

  async findOneById(quizId: Uuid) {
    const quiz: QuizEntity = Optional.of(
      await this.quizRepository.findOne({ where: { id: quizId } }),
    )
      .throwIfNullable(new NotFoundException('Quiz is not found'))
      .get();
    return quiz.toDto(QuizResDto);
  }

  async findOneDetailById(quizId: Uuid) {
    const quiz: QuizEntity = Optional.of(
      await this.quizRepository.findOne({
        where: { id: quizId },
        relations: ['quizzfly'],
      }),
    )
      .throwIfNullable(new NotFoundException('Quiz is not found'))
      .get();

    return quiz;
  }

  async duplicateQuiz(quizzflyId: Uuid, quizId: Uuid, userId: Uuid) {
    const quiz = await this.findOneDetailById(quizId);
    if (quiz.quizzfly.userId !== userId || quiz.quizzfly.id !== quizzflyId) {
      throw new ForbiddenException(
        'You do not have permission to modify this quiz.',
      );
    }

    delete quiz.quizzfly;
    const dto = { ...quiz, ...defaultInstanceEntity };
    const quizDuplicate = new QuizEntity(dto);
    quizDuplicate.prevElementId = quiz.id;
    await quizDuplicate.save();

    const behindQuestion = await this.quizzflyService.getBehindQuestion(
      quizzflyId,
      quizId,
    );

    if (behindQuestion) {
      if (behindQuestion.type === PrevElementType.SLIDE) {
        await this.slideService.changePrevPointerSlide(
          behindQuestion.id,
          quizDuplicate.id,
        );
      } else if (behindQuestion.type === PrevElementType.QUIZ) {
        await this.changePrevPointerQuiz(behindQuestion.id, quizDuplicate.id);
      }
    }

    return quizDuplicate.toDto(QuizResDto);
  }

  async updateOne(
    quizzflyId: Uuid,
    quizId: Uuid,
    userId: Uuid,
    dto: Partial<QuizEntity>,
  ) {
    const quiz = await this.findOneDetailById(quizId);
    if (quiz.quizzfly.userId !== userId || quiz.quizzfly.id !== quizzflyId) {
      throw new ForbiddenException(
        'You do not have permission to modify this quiz.',
      );
    }

    Object.assign(quiz, dto);
    await this.quizRepository.save(quiz);

    return quiz.toDto(QuizResDto);
  }

  async deleteOne(quizzflyId: Uuid, quizId: Uuid, userId: Uuid) {
    const quiz = await this.findOneDetailById(quizId);
    if (quiz.quizzfly.userId !== userId || quiz.quizzfly.id !== quizzflyId) {
      throw new ForbiddenException(
        'You do not have permission to modify this quiz.',
      );
    }

    await this.quizRepository.softDelete({ id: quizId });

    const behindQuestion = await this.quizzflyService.getBehindQuestion(
      quizzflyId,
      quizId,
    );

    if (behindQuestion) {
      if (behindQuestion.type === PrevElementType.SLIDE) {
        await this.slideService.changePrevPointerSlide(
          behindQuestion.id,
          quiz.prevElementId,
        );
      } else if (behindQuestion.type === PrevElementType.QUIZ) {
        await this.changePrevPointerQuiz(behindQuestion.id, quiz.prevElementId);
      }
    }
  }

  async changePrevPointerQuiz(quizId: Uuid, prevElementId: Uuid) {
    const quiz = await this.findOneDetailById(quizId);

    quiz.prevElementId = prevElementId;
    await this.quizRepository.save(quiz);
  }
}
