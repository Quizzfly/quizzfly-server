import { ParticipantAnswerEntity } from '@modules/room/entities/participant-answer.entity';
import { ParticipantAnswerRepository } from '@modules/room/repositories/participant-answer.repository';
import { QuestionService } from '@modules/room/services/question.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ParticipantAnswerService {
  constructor(
    private readonly repository: ParticipantAnswerRepository,
    private readonly questionService: QuestionService,
  ) {}

  async answerQuestion(dto: Partial<ParticipantAnswerEntity>) {
    await this.questionService.findOneQuestion(dto.questionId);

    const participantAnswer = new ParticipantAnswerEntity(dto);

    return this.repository.save(participantAnswer);
  }
}
