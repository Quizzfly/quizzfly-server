import {
  ClassFieldOptional,
  StringFieldOptional,
} from '@core/decorators/field.decorators';
import { FileInfoResDto } from '@modules/file/dto/file-info.res.dto';
import { Expose } from 'class-transformer';

export class CreateSlideReqDto {
  @StringFieldOptional()
  content?: string;

  @ClassFieldOptional(() => FileInfoResDto, { each: true, isArray: true })
  files?: FileInfoResDto[];

  @StringFieldOptional({ name: 'background_url' })
  @Expose({ name: 'background_url' })
  backgroundUrl?: string;
}
