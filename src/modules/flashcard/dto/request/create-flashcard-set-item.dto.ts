import {
  NumberField,
  StringField,
  StringFieldOptional,
} from '@/core/decorators/field.decorators';

export class CreateFlashcardSetItemDto {
  @StringField()
  question: string;

  @StringField()
  answer: string;

  @NumberField({ int: true, min: 0 })
  rank: number;

  @StringFieldOptional({ isArray: true, each: true, minItems: 3, maxItems: 3 })
  options: string[];

  @StringFieldOptional()
  image_url: string;

  @StringFieldOptional()
  audio_url: string;
}
