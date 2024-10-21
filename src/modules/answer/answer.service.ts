import { AnswerRepository } from '@modules/answer/repositories/answer.repository';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AnswerService {
  private readonly logger = new Logger(AnswerService.name);

  constructor(private readonly answerRepository: AnswerRepository) {}
}
