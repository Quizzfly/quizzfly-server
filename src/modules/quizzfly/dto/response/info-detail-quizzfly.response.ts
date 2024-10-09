import { Uuid } from '@common/types/common.type';
import { StringField } from '@core/decorators/field.decorators';
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

  isPublic: boolean;

  @StringField()
  @Expose()
  quizzflyStatus: QuizzflyStatus;

  createdAt: Date;

  static toInfoDetailQuizzflyResponse(
    quizzflyEntity: QuizzflyEntity,
  ): InfoDetailQuizzflyResDto {
    const dto = new InfoDetailQuizzflyResDto();
    dto.id = quizzflyEntity.id;
    dto.title = quizzflyEntity.title;
    dto.description = quizzflyEntity.description;
    dto.coverImage = quizzflyEntity.coverImage;
    dto.theme = quizzflyEntity.theme;
    dto.isPublic = quizzflyEntity.isPublic;
    dto.quizzflyStatus = quizzflyEntity.quizzflyStatus;
    dto.createdAt = quizzflyEntity.createdAt;
    return dto;
  }
}
