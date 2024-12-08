import { BaseResDto } from '@common/dto/base.res.dto';
import { Uuid } from '@common/types/common.type';
import {
  BooleanField,
  StringField,
  UUIDField,
} from '@core/decorators/field.decorators';
import { QuizzflyStatus } from '@modules/quizzfly/entity/enums/quizzfly-status.enum';
import { QuizzflyEntity } from '@modules/quizzfly/entity/quizzfly.entity';
import { UserEntity } from '@modules/user/entities/user.entity';

export class QuizzflyDetailResDto extends BaseResDto {
  @StringField()
  title: string;

  @StringField({ name: 'cover_image' })
  coverImage: string;

  @BooleanField({ name: 'is_public' })
  isPublic: boolean;

  @StringField({ name: 'quizzfly_status' })
  quizzflyStatus: QuizzflyStatus;

  @UUIDField({ name: 'user_id' })
  userId: Uuid;

  @StringField()
  username: string;

  @StringField()
  avatar: string;

  static toInfoQuizzflyResponse(
    quizzflyEntity: QuizzflyEntity,
    userEntity: UserEntity,
  ): QuizzflyDetailResDto {
    const dto = new QuizzflyDetailResDto();
    dto.id = quizzflyEntity.id;
    dto.title = quizzflyEntity.title;
    dto.coverImage = quizzflyEntity.coverImage;
    dto.quizzflyStatus = quizzflyEntity.quizzflyStatus;
    dto.createdAt = quizzflyEntity.createdAt;
    dto.isPublic = quizzflyEntity.isPublic;

    dto.userId = userEntity.id;
    dto.username = userEntity.userInfo.username;
    dto.avatar = userEntity.userInfo.avatar;

    return dto;
  }
}
