import { plainToInstance } from 'class-transformer';
import { FLashCardSetDetailResDto } from '../dto/response/flashcard-set-detail.res.dto';
import { FlashcardSetResDto } from '../dto/response/flashcard-set.res.dto';
import { FlashcardSetEntity } from '../entities/flashcard-set.entity';
export class FlashcardSetMapper {
  static toDto(entity: FlashcardSetEntity): FlashcardSetResDto {
    return plainToInstance(FlashcardSetResDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  static toDtos(entities: FlashcardSetEntity[]): FlashcardSetResDto[] {
    return plainToInstance(FlashcardSetResDto, entities, {
      excludeExtraneousValues: true,
    });
  }

  static toDetailDto(entity: FlashcardSetEntity): FLashCardSetDetailResDto {
    return plainToInstance(FLashCardSetDetailResDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
