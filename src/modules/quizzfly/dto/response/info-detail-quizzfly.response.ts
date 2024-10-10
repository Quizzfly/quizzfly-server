import { Uuid } from '@common/types/common.type';
import { BooleanField, DateField, StringField } from '@core/decorators/field.decorators';
import { QuizzflyStatus } from '@modules/quizzfly/entity/enums/quizzfly-status.enum';
import { QuizzflyEntity } from '@modules/quizzfly/entity/quizzfly.entity';
import { Expose } from 'class-transformer';

export class InfoDetailQuizzflyResDto {
  id: Uuid;

  @StringField()
  title: string;

  @StringField()
  description: string;

  @StringField()
  coverImage: string;

  @StringField()
  theme: string;

  @BooleanField()
  isPublic: boolean;

  @StringField()
  @Expose()
  quizzflyStatus: QuizzflyStatus;

  @DateField()
  createdAt: Date;
}
