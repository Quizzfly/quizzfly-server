import { Uuid } from '@/common/types/common.type';
import { Optional } from '@/core/utils/optional';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { CreateFlashcardSetDto } from '../dto/request/create-flashcard-set.dto';
import { FlashcardSetEntity } from '../entities/flashcard-set.entity';
import { FlashcardEntity } from '../entities/flashcard.entity';
import { FlashcardSetRepository } from '../repositories/flashcard-set.repository';

@Injectable()
export class FlashcardSetService {
  constructor(private readonly repository: FlashcardSetRepository) {}

  @Transactional()
  async create(userId: Uuid, dto: CreateFlashcardSetDto) {
    await this.checkFlashCardSetExit(userId, dto.title);

    const flashcards = dto.flashcards.map(
      (item, index) =>
        new FlashcardEntity({ ...item, rank: item.rank ?? index }),
    );

    const set = new FlashcardSetEntity({ ...dto, flashcards });
    set.owner_id = userId;

    return this.repository.save(set);
  }

  async findById(id: Uuid) {
    return Optional.of(await this.repository.findOneBy({ id }))
      .throwIfNullable(new NotFoundException('Flash card set not found'))
      .get<FlashcardSetEntity>();
  }

  async findByIdAndDetail(id: Uuid) {
    return Optional.of(await this.repository.findByIdAndDetail(id))
      .throwIfNullable(new NotFoundException('Flash card set not found'))
      .get<FlashcardSetEntity>();
  }

  async paginate() {}

  async update() {}

  async delete() {}

  async checkFlashCardSetExit(userId: Uuid, title: string) {
    Optional.of(
      await this.repository.countBy({ owner_id: userId, title }),
    ).throwIfPresent(
      new ConflictException('Flash card set with title already exist'),
    );
  }
}
