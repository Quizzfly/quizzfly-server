import { Uuid } from '@common/types/common.type';
import {
  BooleanField,
  DateField,
  StringField,
} from '@core/decorators/field.decorators';
import { QuizzflyStatus } from '@modules/quizzfly/entity/enums/quizzfly-status.enum';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class InfoDetailQuizzflyResDto {
  @Expose()
  id: Uuid;

  @StringField()
  @Expose()
  title: string;

  @StringField()
  @Expose()
  description: string;

  @StringField()
  @Expose()
  coverImage: string;

  @StringField()
  @Expose()
  theme: string;

  @BooleanField()
  isPublic: boolean;

  @StringField()
  @Expose()
  quizzflyStatus: QuizzflyStatus;

  @DateField()
  @Expose()
  createdAt: Date;
}
