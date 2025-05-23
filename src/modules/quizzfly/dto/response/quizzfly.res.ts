import { BaseResDto } from '@common/dto/base.res.dto';
import { BooleanField, StringField } from '@core/decorators/field.decorators';
import { QuizzflyStatus } from '@modules/quizzfly/entity/enums/quizzfly-status.enum';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class QuizzflyResDto extends BaseResDto {
  @StringField()
  @Expose()
  title: string;

  @StringField()
  @Expose()
  description: string;

  @StringField({ name: 'cover_image' })
  @Expose()
  coverImage: string;

  @StringField()
  @Expose()
  theme: string;

  @BooleanField({ name: 'is_public' })
  @Expose()
  isPublic: boolean;

  @StringField({ name: 'quizzfly_status' })
  @Expose()
  quizzflyStatus: QuizzflyStatus;
}
