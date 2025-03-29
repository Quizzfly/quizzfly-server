import {
  BooleanFieldOptional,
  StringFieldOptional,
} from '@core/decorators/field.decorators';
import { QuizzflyStatus } from '@modules/quizzfly/entity/enums/quizzfly-status.enum';
import { Expose } from 'class-transformer';

export class SettingQuizzflyReqDto {
  @StringFieldOptional()
  title?: string;

  @StringFieldOptional()
  description?: string;

  @BooleanFieldOptional({ name: 'is_public' })
  @Expose({ name: 'is_public' })
  isPublic?: boolean;

  @StringFieldOptional({ name: 'cover_image' })
  @Expose({ name: 'cover_image' })
  coverImage?: string;

  @StringFieldOptional({
    name: 'quizzfly_status',
    example: Object.values(QuizzflyStatus).join('|'),
  })
  @Expose({ name: 'quizzfly_status' })
  quizzflyStatus?: QuizzflyStatus;
}
