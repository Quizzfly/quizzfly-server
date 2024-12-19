import { Uuid } from '@common/types/common.type';
import { Order } from '@core/constants/app.constant';
import { ParticipantResultResDto } from '@modules/room/dto/response/participant-result.res.dto';
import { ParticipantAnswerEntity } from '@modules/room/entities/participant-answer.entity';
import { ParticipantAnswerRepository } from '@modules/room/repositories/participant-answer.repository';
import { QuestionService } from '@modules/room/services/question.service';
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

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

  async getListResultByParticipant(participantId: Uuid) {
    const answers = await this.repository.find({
      where: { participantId: participantId },
      relations: { question: true },
      order: { question: { questionIndex: Order.ASC } },
    });

    return plainToInstance(ParticipantResultResDto, answers, {
      excludeExtraneousValues: true,
    });
  }
}
