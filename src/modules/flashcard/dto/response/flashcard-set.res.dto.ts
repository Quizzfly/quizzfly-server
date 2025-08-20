import { BaseResDto } from '@/common/dto/base.res.dto';
import {
  ClassFieldOptional,
  EnumField,
  NumberField,
  StringField,
  UUIDFieldOptional,
} from '@/core/decorators/field.decorators';
import { BaseUserDto } from '@/shared/dto/base-user.dto';
import { Expose, Transform } from 'class-transformer';
import { FLASHCARD_VISIBILITY } from '../../enums';

export class FlashcardSetResDto extends BaseResDto {
  @StringField()
  @Expose()
  title: string;

  @StringField()
  @Expose()
  description: string;

  @EnumField(() => FLASHCARD_VISIBILITY)
  @Expose()
  visibility: FLASHCARD_VISIBILITY;

  @UUIDFieldOptional()
  @Expose()
  owner_id: string;

  @ClassFieldOptional(() => BaseUserDto)
  @Expose()
  owner: BaseUserDto;

  @NumberField()
  @Expose()
  @Transform(({ obj }) => obj.flashcards?.length || 0)
  flashcards_count: number;
}
