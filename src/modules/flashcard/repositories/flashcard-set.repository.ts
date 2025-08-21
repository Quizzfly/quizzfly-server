import { Uuid } from '@/common/types/common.type';
import { Order } from '@/core/constants/app.constant';
import { Injectable } from '@nestjs/common';
import { DataSource, ILike, Repository } from 'typeorm';
import { FilterFlashcardSetDto } from '../dto/request/filter-flashcard-set.dto';
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
      order: {
        flashcards: { sort_order: Order.ASC },
      },
    });
  }

  async paginate(filterOptions: FilterFlashcardSetDto) {
    return this.findAndCount({
      where: {
        visibility: filterOptions.visibility,
        title: filterOptions.keywords
          ? ILike(`%${filterOptions.keywords}%`)
          : undefined,
        owner_id: filterOptions.owner_id,
      },

      relations: ['owner', 'owner.userInfo', 'flashcards'],
      select: {
        flashcards: { id: true },
        owner: {
          id: true,
          email: true,
          userInfo: { avatar: true, name: true },
        },
      },
      skip: filterOptions.offset,
      take: filterOptions.limit,
      order: { createdAt: filterOptions.order },
    });
  }
}
