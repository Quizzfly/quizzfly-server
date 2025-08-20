import { ClassFieldOptional } from '@/core/decorators/field.decorators';
import { FlashcardSetResDto } from './flashcard-set.res.dto';
import { FlashcardResDto } from './flashcard.res.dto';

export class FLashCardSetDetailResDto extends FlashcardSetResDto {
  @ClassFieldOptional(() => FlashcardResDto, { isArray: true, each: true })
  flashcards: FlashcardResDto[];
}
