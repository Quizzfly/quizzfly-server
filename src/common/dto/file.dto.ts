import { NumberField, StringField } from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

export class FileDto {
  @Expose({ name: 'public_id' })
  @StringField({ name: 'public_id' })
  publicId: string;

  @Expose({ name: 'original_filename' })
  @StringField({ name: 'original_filename' })
  originalFilename: string;

  @StringField()
  format: string;

  @Expose({ name: 'resource_type' })
  @StringField({ name: 'resource_type' })
  resourceType: string;

  @StringField()
  url: string;

  @NumberField()
  bytes: number;
}
