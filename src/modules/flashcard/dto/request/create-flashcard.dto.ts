import {
  NumberField,
  StringField,
  StringFieldOptional,
  UUIDField,
} from '@/core/decorators/field.decorators';

export class CreateFlashcardDto {
  @UUIDField()
  set_id: string;

  @NumberField({ int: true, min: 0 })
  rank: number;

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
