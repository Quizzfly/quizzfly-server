import { plainToInstance } from 'class-transformer';
import { FlashcardEntity } from '../entities/flashcard.entity';
import { FlashcardResDto } from './../dto/response/flashcard.res.dto';

export class FlashcardMapper {
  static toDto(entity: FlashcardEntity): FlashcardResDto {
    return plainToInstance(FlashcardResDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  static toDtos(entities: FlashcardEntity[]): FlashcardResDto[] {
    return plainToInstance(FlashcardResDto, entities, {
      excludeExtraneousValues: true,
    });
  }
}
