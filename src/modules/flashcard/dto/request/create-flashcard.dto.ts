import { Uuid } from '@/common/types/common.type';
import {
  StringField,
  StringFieldOptional,
  UUIDField,
  UUIDFieldOptional,
} from '@/core/decorators/field.decorators';

export class CreateFlashcardDto {
  @UUIDField()
  set_id: Uuid;

  @StringField()
  question: string;

  @StringField()
  answer: string;

  @StringFieldOptional({ isArray: true, each: true, minItems: 3, maxItems: 3 })
  options: string[];

  @StringFieldOptional()
  image_url: string;

  @StringFieldOptional()
  audio_url: string;

  @UUIDFieldOptional({ nullable: true })
  previous_flashcard_id?: Uuid;
}
