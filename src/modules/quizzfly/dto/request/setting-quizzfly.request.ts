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
  isPublic?: boolean;

  @StringFieldOptional()
  coverImage?: string;
}
