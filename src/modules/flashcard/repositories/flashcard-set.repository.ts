import { Uuid } from '@/common/types/common.type';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { FlashcardSetEntity } from '../entities/flashcard-set.entity';

@Injectable()
export class FlashcardSetRepository extends Repository<FlashcardSetEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(FlashcardSetEntity, dataSource.createEntityManager());
  }

  async findByIdAndDetail(id: Uuid) {
    return this.findOne({
      where: { id },
      relations: ['owner', 'owner.userInfo', 'flashcards'],
      select: {
        flashcards: true,
        owner: {
          id: true,
          email: true,
          userInfo: { avatar: true, name: true },
        },
      },
    });
  }
}
