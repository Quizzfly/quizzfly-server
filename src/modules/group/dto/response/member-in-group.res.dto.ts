import { StringField } from '@core/decorators/field.decorators';
import { UserInfoResDto } from '@modules/user/dto/response/user-info.res.dto';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class MemberInGroupResDto extends UserInfoResDto {
  @StringField()
  @Expose()
  role: string;
}
