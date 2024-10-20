import {
  BooleanFieldOptional,
  StringFieldOptional,
} from '@core/decorators/field.decorators';

export class SettingQuizzflyReqDto {
  @StringFieldOptional()
  title?: string;

  @StringFieldOptional()
  description?: string;

  @BooleanFieldOptional()
  is_public?: boolean;

  @StringFieldOptional()
  cover_image?: string;
}
