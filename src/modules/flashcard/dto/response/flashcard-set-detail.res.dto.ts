import { ClassFieldOptional } from '@/core/decorators/field.decorators';
import { Expose } from 'class-transformer';
import { FlashcardSetResDto } from './flashcard-set.res.dto';
import { FlashcardResDto } from './flashcard.res.dto';

export class FlashcardSetDetailResDto extends FlashcardSetResDto {
  @ClassFieldOptional(() => FlashcardResDto, { isArray: true, each: true })
  @Expose()
  flashcards: FlashcardResDto[];
}
