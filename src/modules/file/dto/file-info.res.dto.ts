import { NumberField, StringField } from '@core/decorators/field.decorators';

export class FileInfoResDto {
  @StringField()
  originalFilename: string;

  @StringField()
  format: string;

  @StringField()
  resourceType: string;

  @StringField()
  url: string;

  @NumberField()
  bytes: number;
}
