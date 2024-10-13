import { StringField } from '@core/decorators/field.decorators';

export class ChangeThemeQuizzflyReqDto {
  @StringField()
  theme: string;
}
