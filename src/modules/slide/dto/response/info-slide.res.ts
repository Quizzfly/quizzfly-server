import { Uuid } from '@common/types/common.type';
import {
  ClassField,
  StringField,
  StringFieldOptional,
  UUIDField,
  UUIDFieldOptional,
} from '@core/decorators/field.decorators';

export class InfoSlideResDto {
  @UUIDField()
  id: Uuid;

  @StringField()
  content: string;

  @StringFieldOptional({ each: true })
  files: string[];

  @StringField({ name: 'background_color' })
  backgroundColor: string;

  @UUIDFieldOptional({ name: 'prev_element_id', nullable: true })
  prevElementId: Uuid = null;

  @ClassField(() => Date, { name: 'created_at' })
  createdAt: Date;
}
