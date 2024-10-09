import { BooleanFieldOptional, StringFieldOptional } from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

export class SettingQuizzflyReqDto {
  @StringFieldOptional()
  title?: string;

  @StringFieldOptional()
  description?: string;

  @BooleanFieldOptional()
  isPublic?: boolean;

  @StringFieldOptional()
  coverImage?: string;
}
