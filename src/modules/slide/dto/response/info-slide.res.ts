import { Uuid } from '@common/types/common.type';
import {
  ClassField,
  StringField,
  StringFieldOptional,
  UUIDField,
  UUIDFieldOptional,
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

  @StringFieldOptional({ each: true })
  @Expose()
  files: string[];

  @StringField({ name: 'background_color' })
  @Expose()
  backgroundColor: string;

  @UUIDFieldOptional({ name: 'prev_element_id', nullable: true })
  @Expose()
  prevElementId: Uuid = null;

  @ClassField(() => Date, { name: 'created_at' })
  @Expose()
  createdAt: Date;
}
