import { Uuid } from '@common/types/common.type';
import { ErrorCode } from '@core/constants/error-code/error-code.constant';
import { Optional } from '@core/utils/optional';
import { QuestionResDto } from '@modules/room/dto/response/question.res.dto';
import { QuestionEntity } from '@modules/room/entities/question.entity';
import { QuestionRepository } from '@modules/room/repositories/question.repository';
import { RoomService } from '@modules/room/services/room.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

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

  async getListQuestionInRoom(roomId: Uuid) {
    await this.roomService.findById(roomId);

    const questions = await this.repository.findBy({ roomId });

    return plainToInstance(QuestionResDto, questions, {
      excludeExtraneousValues: true,
    });
  }
}
