import { BaseResDto } from '@/common/dto/base.res.dto';
import {
  ClassFieldOptional,
  EnumField,
  StringField,
  UUIDFieldOptional,
} from '@/core/decorators/field.decorators';
import { BaseUserDto } from '@/shared/dto/base-user.dto';
import { Expose } from 'class-transformer';
import { FLASHCARD_VISIBILITY } from '../../enums';

export class FlashcardSetResDto extends BaseResDto {
  @StringField()
  @Expose()
  title: string;

  @StringField()
  @Expose()
  description: string;

  @EnumField(() => FLASHCARD_VISIBILITY)
  visibility: FLASHCARD_VISIBILITY;

  @UUIDFieldOptional()
  @Expose()
  owner_id: string;

  @ClassFieldOptional(() => BaseUserDto)
  @Expose()
  owner: BaseUserDto;
}
