import { BaseResDto } from '@common/dto/base.res.dto';
import { WrapperType } from '@common/types/types';
import { ROLE } from '@core/constants/entity.enum';
import { ClassField, StringField } from '@core/decorators/field.decorators';
import { UserInfoResDto } from '@modules/user/dto/response/user-info.res.dto';
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
@Expose({ toPlainOnly: true })
export class UserResDto extends BaseResDto {
  @StringField()
  @Expose()
  email: string;

  @StringField()
  @Transform(({ obj }) => (obj.role ? obj.role.name : ROLE.USER))
  @Expose()
  role: ROLE;

  @ClassField(() => UserInfoResDto)
  @Expose()
  @Transform(({ obj }) => {
    return obj.userInfoId
      ? {
          id: obj.userInfoId,
          username: obj.userInfoUsername,
          name: obj.userInfoName,
          avatar: obj.userInfoAvatar,
          createdAt: obj.userInfoCreatedAt,
          updatedAt: obj.userInfoUpdatedAt,
        }
      : {
          id: obj.userInfo.id,
          username: obj.userInfo.username,
          name: obj.userInfo.name,
          avatar: obj.userInfo.avatar,
          createdAt: obj.userInfo.createdAt,
          updatedAt: obj.userInfo.updatedAt,
        };
  })
  userInfo?: WrapperType<UserInfoResDto>;
}
