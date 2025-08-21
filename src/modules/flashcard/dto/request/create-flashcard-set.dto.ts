import {
  ClassField,
  EnumField,
  StringField,
} from '@/core/decorators/field.decorators';
import { FLASHCARD_VISIBILITY } from '../../enums';
import { CreateFlashcardSetItemDto } from './create-flashcard-set-item.dto';

export class CreateFlashcardSetDto {
  @StringField()
  title: string;

  @StringField()
  description: string;

  @EnumField(() => FLASHCARD_VISIBILITY)
  visibility: FLASHCARD_VISIBILITY;

  @ClassField(() => CreateFlashcardSetItemDto, {
    minItems: 2,
    each: true,
    isArray: true,
  })
  flashcards: CreateFlashcardSetItemDto[];
}
