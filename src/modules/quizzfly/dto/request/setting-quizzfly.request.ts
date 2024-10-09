import { StringFieldOptional } from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

export class SettingQuizzflyReqDto {
  @StringFieldOptional()
  title?: string;

  @StringFieldOptional()
  description?: string;

  @Expose({ name: 'is_public' })
  isPublic?: boolean;

  @StringFieldOptional({ name: 'cover_image' })
  coverImage?: string;
}
