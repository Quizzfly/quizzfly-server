import { Uuid } from '@common/types/common.type';
import {
  ClassField,
  ClassFieldOptional,
  StringField,
  UUIDField,
  UUIDFieldOptional,
} from '@core/decorators/field.decorators';
import { FileResDto } from '@modules/file/dto/file.res.dto';
import { Expose } from 'class-transformer';

@Expose()
export class InfoSlideResDto {
  @UUIDField()
  @Expose()
  id: Uuid;

  @StringField()
  @Expose()
  content: string;

  @ClassFieldOptional(() => FileResDto, { each: true, isArray: true })
  @Expose()
  files?: FileResDto[];

  @StringField({ name: 'background_url' })
  @Expose()
  backgroundUrl: string;

  @UUIDFieldOptional({ name: 'prev_element_id', nullable: true })
  @Expose()
  prevElementId: Uuid = null;

  @ClassField(() => Date, { name: 'created_at' })
  @Expose()
  createdAt: Date;
}
