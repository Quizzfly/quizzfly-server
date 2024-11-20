import {
  BooleanFieldOptional,
  StringField,
} from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

export class ChangeThemeQuizzflyReqDto {
  @StringField()
  theme: string;

  @BooleanFieldOptional({ name: 'apply_to_all' })
  @Expose({ name: 'apply_to_all' })
  applyToAll?: boolean;
}
