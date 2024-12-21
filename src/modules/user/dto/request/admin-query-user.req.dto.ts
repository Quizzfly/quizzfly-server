import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { BooleanField } from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

@Expose()
export class AdminQueryUserReqDto extends PageOptionsDto {
  @BooleanField({ default: false, name: 'is_deleted' })
  @Expose({ name: 'is_deleted' })
  readonly isDeleted?: boolean;
}
