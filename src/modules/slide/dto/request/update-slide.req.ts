import { FileDto } from '@common/dto/file.dto';
import {
  ClassFieldOptional,
  StringFieldOptional,
} from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

export class UpdateSlideReqDto {
  @StringFieldOptional()
  content?: string;

  @ClassFieldOptional(() => FileDto, { each: true, isArray: true })
  files?: FileDto[];

  @StringFieldOptional({ name: 'background_color' })
  @Expose({ name: 'background_color' })
  backgroundColor?: string;
}
