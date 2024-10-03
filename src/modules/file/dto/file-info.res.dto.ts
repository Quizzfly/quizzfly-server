import { NumberField, StringField } from '@core/decorators/field.decorators';

export class FileInfoResDto {
  @StringField()
  format: string;

  @StringField()
  resourceType: string;

  @StringField()
  url: string;

  @NumberField()
  bytes: number;
}
