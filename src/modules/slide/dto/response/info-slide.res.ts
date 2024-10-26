import { FileDto } from '@common/dto/file.dto';
import { Uuid } from '@common/types/common.type';
import {
  ClassField,
  ClassFieldOptional,
  StringField,
  UUIDField,
  UUIDFieldOptional,
} from '@core/decorators/field.decorators';

export class InfoSlideResDto {
  @UUIDField()
  id: Uuid;

  @StringField()
  content: string;

  @ClassFieldOptional(() => FileDto, { each: true, isArray: true })
  files?: FileDto[];

  @StringField({ name: 'background_color' })
  backgroundColor: string;

  @UUIDFieldOptional({ name: 'prev_element_id', nullable: true })
  prevElementId: Uuid = null;

  @ClassField(() => Date, { name: 'created_at' })
  createdAt: Date;
}
