import { NumberField, StringField } from '@core/decorators/field.decorators';

export class FileResDto {
  @StringField({ name: 'public_id' })
  publicId: string;

  @StringField({ name: 'original_filename' })
  originalFilename: string;

  @StringField()
  format: string;

  @StringField({ name: 'resource_type' })
  resourceType: string;

  @StringField()
  url: string;

  @NumberField()
  bytes: number;
}
