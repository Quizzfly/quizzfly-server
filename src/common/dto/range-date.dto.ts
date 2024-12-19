import { StringFieldOptional } from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';
import { IsDateString } from 'class-validator';

@Expose()
export class RangeDateDto {
  @StringFieldOptional({
    name: 'from_date',
    default: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
  })
  @IsDateString()
  @Expose({ name: 'from_date' })
  fromDate: string = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  @StringFieldOptional({
    name: 'to_date',
    default: new Date().toISOString().slice(0, 10),
  })
  @IsDateString()
  @Expose({ name: 'to_date' })
  toDate: string = new Date().toISOString().slice(0, 10);
}
