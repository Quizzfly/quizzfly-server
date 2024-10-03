import { WrapperType } from '@common/types/types';
import { ROLE } from '@core/constants/entity.enum';
import { ClassField, StringField } from '@core/decorators/field.decorators';
import { UserInfoResDto } from '@modules/user/dto/response/user-info.res.dto';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResDto {
  @StringField()
  @Expose()
  id: string;

  @StringField()
  @Expose()
  email: string;

  @StringField()
  @Expose()
  role: ROLE;

  @ClassField(() => Date)
  @Expose()
  createdAt: Date;

  @ClassField(() => Date)
  @Expose()
  updatedAt: Date;

  @ClassField(() => UserInfoResDto)
  @Expose()
  userInfo?: WrapperType<UserInfoResDto>;
}
