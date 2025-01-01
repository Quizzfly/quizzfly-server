import { Uuid } from '@common/types/common.type';
import {
  BooleanField,
  ClassField,
  StringField,
  UUIDField,
} from '@core/decorators/field.decorators';
import { QuizzflyStatus } from '@modules/quizzfly/entity/enums/quizzfly-status.enum';
import { Expose, Transform } from 'class-transformer';

@Expose({ toPlainOnly: true })
export class InfoSharedResDto {
  @UUIDField()
  @Transform(({ obj }) => obj?.quizzfly?.id || null)
  @Expose()
  id: string;

  @ClassField(() => Date, { name: 'created_at' })
  @Transform(({ obj }) => obj?.quizzfly?.createdAt || null)
  @Expose()
  createdAt: Date;

  @StringField()
  @Transform(({ obj }) => obj?.quizzfly?.title || null)
  @Expose()
  title: string;

  @StringField({ name: 'cover_image' })
  @Transform(({ obj }) => obj?.quizzfly?.coverImage || null)
  @Expose()
  coverImage: string;

  @StringField({ name: 'description' })
  @Transform(({ obj }) => obj?.quizzfly?.description || null)
  @Expose()
  description: string;

  @BooleanField({ name: 'is_public' })
  @Transform(({ obj }) => obj?.quizzfly?.isPublic || null)
  @Expose()
  isPublic: boolean;

  @StringField({ name: 'quizzfly_status' })
  @Transform(({ obj }) => obj?.quizzfly?.quizzflyStatus || null)
  @Expose()
  quizzflyStatus: QuizzflyStatus;

  @UUIDField({ name: 'user_id' })
  @Transform(({ obj }) => obj?.member?.id || null)
  @Expose()
  userId: Uuid;

  @StringField()
  @Transform(({ obj }) => obj?.member?.userInfo?.username || null)
  @Expose()
  username: string;

  @StringField()
  @Transform(({ obj }) => obj?.member?.userInfo?.avatar || null)
  @Expose()
  avatar: string;
}
