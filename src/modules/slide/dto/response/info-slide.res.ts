import { Uuid } from '@common/types/common.type';
import {
  ClassField,
  ClassFieldOptional,
  StringField,
  UUIDField,
  UUIDFieldOptional,
} from '@core/decorators/field.decorators';
import { FileResDto } from '@modules/file/dto/file.res.dto';
import { Exclude } from 'class-transformer';

@Exclude()
export class InfoSlideResDto {
  @UUIDField()
  id: Uuid;

  @StringField()
  content: string;

  @ClassFieldOptional(() => FileResDto, { each: true, isArray: true })
  files?: FileResDto[];

  @StringField({ name: 'background_url' })
  backgroundUrl: string;

  @UUIDFieldOptional({ name: 'prev_element_id', nullable: true })
  prevElementId: Uuid = null;

  @ClassField(() => Date, { name: 'created_at' })
  createdAt: Date;
}
