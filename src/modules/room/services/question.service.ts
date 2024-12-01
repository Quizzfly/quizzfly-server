import { Uuid } from '@common/types/common.type';
import { ErrorCode } from '@core/constants/error-code/error-code.constant';
import { Optional } from '@core/utils/optional';
import { QuestionEntity } from '@modules/room/entities/question.entity';
import { Question } from '@modules/room/model/room.model';
import { QuestionRepository } from '@modules/room/repositories/question.repository';
import { RoomService } from '@modules/room/services/room.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { FindManyOptions } from 'typeorm';

@Injectable()
export class QuestionService {
  constructor(
    private readonly repository: QuestionRepository,
    private readonly roomService: RoomService,
  ) {}

  async insertMany(hostId: Uuid, roomId: Uuid, items: QuestionEntity[]) {
    const room = await this.roomService.findById(roomId);
    if (hostId !== room.hostId) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }

    const questions = await this.repository.save(items);
    return plainToInstance(QuestionEntity, questions, {
      excludeExtraneousValues: true,
    });
  }

  async findOneQuestion(questionId: Uuid) {
    return <QuestionEntity>Optional.of(
      await this.repository.findOneBy({ id: questionId }),
    )
      .throwIfNullable(new NotFoundException('Question does not exist'))
      .get();
  }

  async updateQuestion(questionId: Uuid, dto: Partial<QuestionEntity>) {
    const question = await this.findOneQuestion(questionId);
    Object.assign(question, dto);

    return this.repository.save(question);
  }

  async findAll(filter: FindManyOptions<Question>) {
    return this.repository.find(filter);
  }
}
