import { StringFieldOptional } from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

export class UpdateSlideReqDto {
  @StringFieldOptional()
  content?: string;

  @StringFieldOptional({ each: true })
  files?: string[];

  @StringFieldOptional({ name: 'background_color' })
  @Expose({ name: 'background_color' })
  backgroundColor?: string;
}
