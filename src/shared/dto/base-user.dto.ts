import { UserInfoResDto } from '@/modules/user/dto/response/user-info.res.dto';
import { Uuid } from '@common/types/common.type';
import { StringField, UUIDField } from '@core/decorators/field.decorators';
import { Exclude, Expose, Transform } from 'class-transformer';

@Expose()
export class BaseUserDto {
  @UUIDField()
  @Expose()
  id: Uuid;

  @StringField()
  @Expose()
  email: string;

  @StringField()
  @Expose()
  @Transform(({ obj: { username, userInfo } }) => username ?? userInfo.username)
  username: string;

  @StringField()
  @Expose()
  @Transform(({ obj: { name, userInfo } }) => name ?? userInfo.name)
  name: string;

  @StringField()
  @Expose()
  @Transform(({ obj: { avatar, userInfo } }) => avatar ?? userInfo.avatar)
  avatar: string;

  @Exclude()
  userInfo?: UserInfoResDto;
}
