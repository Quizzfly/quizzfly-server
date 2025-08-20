import {
  StringField,
  StringFieldOptional,
  UUIDField,
} from '@/core/decorators/field.decorators';

export class CreateFlashcardDto {
  @UUIDField()
  set_id: string;

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
}
