import { StringFieldOptional } from '@core/decorators/field.decorators';

export class UpdateSlideReqDto {
  @StringFieldOptional()
  content?: string;

  @StringFieldOptional({ each: true })
  files?: string[];

  @StringFieldOptional()
  backgroundColor?: string;
}
