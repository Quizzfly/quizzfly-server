import { Uuid } from '@common/types/common.type';
import { SessionEntity } from '@modules/session/entities/session.entity';
import { SessionRepository } from '@modules/session/repositories/session.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not } from 'typeorm';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: SessionRepository,
  ) {}

  async findById(id: Uuid) {
    return this.sessionRepository.findOne({ where: { id } });
  }

  async create(createSessionDto: CreateSessionDto) {
    const newSession = new SessionEntity({
      hash: createSessionDto.hash,
      userId: createSessionDto.userId,
    });

    return newSession.save();
  }

  async update(id: Uuid, updateSessionDto: UpdateSessionDto) {
    await this.sessionRepository.update(id, updateSessionDto);
    return this.findById(id);
  }

  async deleteById(id: Uuid | string) {
    return this.sessionRepository.delete(id);
  }

  deleteByUserId(conditions: { userId: Uuid }) {
    return this.sessionRepository.delete(conditions);
  }

  deleteByUserIdWithExclude(conditions: {
    userId: Uuid;
    excludeSessionId: Uuid;
  }) {
    return this.sessionRepository.delete({
      userId: conditions.userId,
      id: Not(conditions.excludeSessionId),
    });
  }
}
