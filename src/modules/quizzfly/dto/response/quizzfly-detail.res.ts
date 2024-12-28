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
import { Expose, Transform } from 'class-transformer';

@Expose()
export class QuizzflyDetailResDto extends BaseResDto {
  @StringField()
  @Expose()
  title: string;

  @StringField({ name: 'cover_image' })
  @Expose()
  coverImage: string;

  @StringField({ name: 'description' })
  @Expose()
  description: string;

  @BooleanField({ name: 'is_public' })
  @Expose()
  isPublic: boolean;

  @StringField({ name: 'quizzfly_status' })
  @Expose()
  quizzflyStatus: QuizzflyStatus;

  @UUIDField({ name: 'user_id' })
  @Expose()
  userId: Uuid;

  @StringField()
  @Transform(({ obj }) => obj?.user?.userInfo?.username ?? null)
  @Expose()
  username: string;

  @StringField()
  @Transform(({ obj }) => obj?.user?.userInfo?.avatar ?? null)
  @Expose()
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
