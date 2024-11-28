import { NumberField, StringField } from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

@Expose()
export class FileResDto {
  @StringField({ name: 'public_id' })
  @Expose()
  publicId: string;

  @StringField({ name: 'original_filename' })
  @Expose()
  originalFilename: string;

  @StringField()
  @Expose()
  format: string;

  @StringField({ name: 'resource_type' })
  @Expose()
  resourceType: string;

  @StringField()
  @Expose()
  url: string;

  @NumberField()
  @Expose()
  bytes: number;
}
