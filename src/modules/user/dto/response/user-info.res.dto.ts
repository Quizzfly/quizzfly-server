import { BaseResDto } from '@common/dto/base.res.dto';
import { StringField } from '@core/decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
@Expose()
export class UserInfoResDto extends BaseResDto {
  @StringField()
  @Expose()
  username: string;

  @StringField()
  @Expose()
  name: string;

  @StringField()
  @Expose()
  avatar: string;
}
