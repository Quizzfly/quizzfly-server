import { BaseResDto } from '@/common/dto/base.res.dto';
import {
  NumberField,
  StringField,
  StringFieldOptional,
  UUIDField,
} from '@/core/decorators/field.decorators';
import { Expose } from 'class-transformer';

export class FlashcardResDto extends BaseResDto {
  @UUIDField()
  @Expose()
  set_id: string;

  @NumberField({ int: true, min: 0 })
  @Expose()
  rank: number;

  @StringField()
  @Expose()
  question: string;

  @StringField()
  @Expose()
  answer: string;

  @StringFieldOptional({ isArray: true, each: true, minItems: 3, maxItems: 3 })
  @Expose()
  options: string[];

  @StringFieldOptional()
  @Expose()
  image_url: string;

  @StringFieldOptional()
  @Expose()
  audio_url: string;
}
