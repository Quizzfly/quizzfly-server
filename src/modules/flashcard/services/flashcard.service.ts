import { Uuid } from '@/common/types/common.type';
import { Order } from '@/core/constants/app.constant';
import { ErrorCode } from '@/core/constants/error-code/error-code.constant';
import { Optional } from '@/core/utils/optional';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { And, ILike, LessThan, MoreThan, Not } from 'typeorm';
import { CreateFlashcardDto } from '../dto/request/create-flashcard.dto';
import { ReorderFlashcardDto } from '../dto/request/reorder-flashcard.dto';
import { UpdateFlashcardDto } from '../dto/request/update-flashcard.dto';
import { FlashcardEntity } from '../entities/flashcard.entity';
import { FlashcardRepository } from '../repositories/flashcard.repository';
import { FlashcardSetService } from './flashcard-set.service';

@Injectable()
export class FlashcardService {
  constructor(
    private readonly flashcardSetService: FlashcardSetService,
    private readonly flashcardRepository: FlashcardRepository,
  ) {}

  async create(userId: Uuid, dto: CreateFlashcardDto) {
    const set = await this.flashcardSetService.findById(dto.set_id);

    if (!set.canAddFLashCard(userId)) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }

    await this.checkExist(dto.set_id, dto.question);

    let newOrder: number;

    if (dto.previous_flashcard_id === null) {
      const firstCard = await this.flashcardRepository.findOne({
        where: { set_id: dto.set_id },
        order: { sort_order: Order.ASC },
      });

      newOrder = firstCard ? firstCard.sort_order - 1000 : 0;
    } else if (dto.previous_flashcard_id === undefined) {
      const lastCard = await this.flashcardRepository.findOne({
        where: { set_id: dto.set_id },
        order: { sort_order: Order.DESC },
      });

      newOrder = lastCard ? lastCard.sort_order + 1000 : 0;
    } else if (dto.previous_flashcard_id) {
      const previousCard = Optional.of(
        await this.flashcardRepository.findOneBy({
          id: dto.previous_flashcard_id,
        }),
      )
        .throwIfNullable(new BadRequestException('Flash card not found'))
        .get<FlashcardEntity>();

      const nextCard = await this.flashcardRepository.findOne({
        where: {
          set_id: dto.set_id,
          sort_order: MoreThan(previousCard.sort_order),
        },
        order: { sort_order: Order.ASC },
      });

      newOrder = nextCard
        ? (previousCard.sort_order + nextCard.sort_order) / 2
        : previousCard.sort_order + 1000;
    }

    const flashcard = new FlashcardEntity({ ...dto, sort_order: newOrder });
    return this.flashcardRepository.save(flashcard);
  }

  async findById(id: Uuid) {
    return Optional.of(await this.flashcardRepository.findOneBy({ id }))
      .throwIfNullable(new BadRequestException('Flash card not found'))
      .get<FlashcardEntity>();
  }

  async update(id: Uuid, dto: UpdateFlashcardDto) {
    const flashcard = await this.findById(id);

    if (flashcard.question !== dto.question) {
      await this.checkExist(flashcard.set_id, dto.question, id);
    }

    Object.assign(flashcard, dto);
    return this.flashcardRepository.save(flashcard);
  }

  async delete(id: Uuid) {
    await this.findById(id);
    await this.flashcardRepository.delete({ id });
  }

  async checkExist(setId: Uuid, question: string, excludeId?: Uuid) {
    Optional.of(
      await this.flashcardRepository.countBy({
        set_id: setId,
        question: ILike(question),
        id: excludeId ? Not(excludeId) : undefined,
      }),
    ).throwIfPresent(
      new ConflictException('Flash card same question in one set'),
    );
  }

  async reorder(id: Uuid, dto: ReorderFlashcardDto) {
    const { previous_id, next_id } = dto;

    const flashcard = await this.findById(id);
    if (flashcard.id === previous_id || flashcard.id === next_id) {
      return flashcard;
    }

    let newOrderIndex: number;

    if (previous_id && next_id) {
      const previousCard = Optional.of(
        await this.flashcardRepository.findOneBy({
          id: previous_id,
          set_id: flashcard.set_id,
        }),
      )
        .throwIfNullable(new NotFoundException('Previous flash card not found'))
        .get<FlashcardEntity>();

      const nextCard = Optional.of(
        await this.flashcardRepository.findOneBy({
          id: next_id,
          set_id: flashcard.set_id,
        }),
      )
        .throwIfNullable(new NotFoundException('Flash card not found'))
        .get<FlashcardEntity>();

      const betweenCards = await this.flashcardRepository.countBy({
        set_id: flashcard.set_id,
        sort_order: And(
          MoreThan(previousCard.sort_order),
          LessThan(nextCard.sort_order),
        ),
      });

      if (betweenCards > 0) {
        throw new BadRequestException(
          'Cannot reorder: before and after flashcards are not adjacent',
        );
      }

      newOrderIndex = (previousCard.sort_order + nextCard.sort_order) / 2;
    } else if (!previous_id) {
      const firstCard = Optional.of(
        await this.flashcardRepository.findOne({
          where: { set_id: flashcard.set_id },
          order: { sort_order: Order.ASC },
        }),
      )
        .throwIfNullable(new NotFoundException('Flash card not found'))
        .get<FlashcardEntity>();

      if (firstCard.id === flashcard.id) {
        return flashcard;
      }

      newOrderIndex = firstCard.sort_order - 1000;
    } else if (!next_id) {
      const lastCard = Optional.of(
        await this.flashcardRepository.findOne({
          where: { set_id: flashcard.set_id },
          order: { sort_order: Order.DESC },
        }),
      )
        .throwIfNullable(new NotFoundException('Flash card not found'))
        .get<FlashcardEntity>();

      if (lastCard.id === flashcard.id) {
        return flashcard;
      }

      newOrderIndex = lastCard.sort_order + 1000;
    }

    flashcard.sort_order = newOrderIndex;

    return this.flashcardRepository.save(flashcard);
  }
}
