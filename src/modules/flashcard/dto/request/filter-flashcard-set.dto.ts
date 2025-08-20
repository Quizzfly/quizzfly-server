import { PageOptionsDto } from '@/common/dto/offset-pagination/page-options.dto';
import {
  EnumFieldOptional,
  UUIDFieldOptional,
} from '@/core/decorators/field.decorators';
import { FLASHCARD_VISIBILITY } from '../../enums';

export class FilterFlashcardSetDto extends PageOptionsDto {
  @EnumFieldOptional(() => FLASHCARD_VISIBILITY)
  visibility?: FLASHCARD_VISIBILITY;

  @UUIDFieldOptional()
  owner_id?: string;
}
