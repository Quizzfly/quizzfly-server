import { ClassField, StringField } from '@core/decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserInfoResDto {
  @StringField()
  @Expose()
  id: string;

  @StringField()
  @Expose()
  username: string;

  @StringField()
  @Expose()
  name: string;

  @StringField()
  @Expose()
  avatar: string;

  @ClassField(() => Date)
  @Expose()
  createdAt: Date;

  @ClassField(() => Date)
  @Expose()
  updatedAt: Date;
}
