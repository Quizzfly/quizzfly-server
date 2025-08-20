import { OffsetPaginationDto } from '@/common/dto/offset-pagination/offset-pagination.dto';
import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@/common/types/common.type';
import { ErrorCode } from '@/core/constants/error-code/error-code.constant';
import { Optional } from '@/core/utils/optional';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Not } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { CreateFlashcardSetDto } from '../dto/request/create-flashcard-set.dto';
import { FilterFlashcardSetDto } from '../dto/request/filter-flashcard-set.dto';
import { UpdateFlashcardSetDto } from '../dto/request/update-flashcard-set.dto';
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
        new FlashcardEntity({ ...item, sort_order: index * 1000 }),
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

  async findByIdAndDetail(id: Uuid, ownerId: Uuid) {
    const set = Optional.of(await this.repository.findByIdAndDetail(id))
      .throwIfNullable(new NotFoundException('Flash card set not found'))
      .get<FlashcardSetEntity>();

    if (!set.canRead(ownerId)) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }

    return set;
  }

  async paginate(query: FilterFlashcardSetDto) {
    const [data, total] = await this.repository.paginate(query);

    const meta = new OffsetPaginationDto(total, query);
    return new OffsetPaginatedDto(data, meta);
  }

  async update(id: Uuid, dto: UpdateFlashcardSetDto, ownerId: Uuid) {
    const set = await this.findById(id);

    if (!set.canUpdate(ownerId)) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }

    if (set.title !== dto.title) {
      await this.checkFlashCardSetExit(set.owner_id, dto.title, id);
    }

    Object.assign(set, dto);
    return this.repository.save(set);
  }

  async delete(id: Uuid, userId: Uuid) {
    const set = await this.findById(id);

    if (!set.canDelete(userId)) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }

    await this.repository.delete(id);
  }

  async checkFlashCardSetExit(userId: string, title: string, excludeId?: Uuid) {
    Optional.of(
      await this.repository.countBy({
        owner_id: userId,
        title,
        id: excludeId ? Not(excludeId) : undefined,
      }),
    ).throwIfPresent(
      new ConflictException('Flash card set with title already exist'),
    );
  }
}
