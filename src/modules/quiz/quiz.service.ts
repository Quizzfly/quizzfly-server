import { CreateQuizReqDto } from '@modules/quiz/dto/request/create-quiz.req.dto';
import { QuizRepository } from '@modules/quiz/repositories/quiz.repository';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  constructor(private readonly quizRepository: QuizRepository) {}

  async create(dto: CreateQuizReqDto) {
    // const quiz = new QuizEntity(dto);
    console.log(dto);
    // console.log(quiz);
    return dto;
  }
}
