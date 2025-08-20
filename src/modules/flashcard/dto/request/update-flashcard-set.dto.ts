import {
  EnumFieldOptional,
  StringFieldOptional,
} from '@/core/decorators/field.decorators';
import { FLASHCARD_VISIBILITY } from '../../enums';

export class UpdateFlashcardSetDto {
  @StringFieldOptional()
  title: string;

  @StringFieldOptional()
  description: string;

  @EnumFieldOptional(() => FLASHCARD_VISIBILITY)
  visibility: FLASHCARD_VISIBILITY;
}
