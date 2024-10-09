import { Uuid } from '@common/types/common.type';
import { StringField } from '@core/decorators/field.decorators';
import { QuizzflyStatus } from '@modules/quizzfly/entity/enums/quizzfly-status.enum';
import { QuizzflyEntity } from '@modules/quizzfly/entity/quizzfly.entity';
import { UserEntity } from '@modules/user/entities/user.entity';
import { Expose } from 'class-transformer';

export class InfoQuizzflyResDto {
  id: Uuid;

  @StringField()
  title: string;

  @StringField()
  coverImage: string;

  @StringField()
  @Expose()
  quizzflyStatus: QuizzflyStatus;

  createdAt: Date;

  userId: Uuid;

  @StringField()
  username: string;

  @StringField()
  avatar: string;

  static toInfoQuizzflyResponse(
    quizzflyEntity: QuizzflyEntity,
    userEntity: UserEntity,
  ): InfoQuizzflyResDto {
    const dto = new InfoQuizzflyResDto();
    dto.id = quizzflyEntity.id;
    dto.title = quizzflyEntity.title;
    dto.coverImage = quizzflyEntity.coverImage;
    dto.quizzflyStatus = quizzflyEntity.quizzflyStatus;
    dto.createdAt = quizzflyEntity.createdAt;

    dto.userId = userEntity.id;
    dto.username = userEntity.userInfo.username;
    dto.avatar = userEntity.userInfo.avatar;

    return dto;
  }
}
