import { Uuid } from '@common/types/common.type';
import {
  DateField,
  NumberField,
  StringField,
  UUIDField,
} from '@core/decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class InfoSlideResDto {
  @UUIDField()
  @Expose()
  id: Uuid;

  @StringField()
  @Expose()
  content: string;

  @Expose()
  files: string[];

  @StringField()
  @Expose()
  backgroundColor: string;

  @NumberField()
  @Expose()
  no: number;

  @DateField()
  @Expose()
  createdAt: Date;
}
