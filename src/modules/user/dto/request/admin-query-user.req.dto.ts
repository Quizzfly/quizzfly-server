import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { BooleanFieldOptional } from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

@Expose()
export class AdminQueryUserReqDto extends PageOptionsDto {
  @BooleanFieldOptional({ default: false, name: 'only_deleted' })
  @Expose({ name: 'only_deleted' })
  readonly onlyDeleted?: boolean;
}
