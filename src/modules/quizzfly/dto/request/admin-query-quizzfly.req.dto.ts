import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { BooleanFieldOptional } from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

@Expose()
export class AdminQueryQuizzflyReqDto extends PageOptionsDto {
  @BooleanFieldOptional({ default: false, name: 'include_deleted' })
  @Expose({ name: 'include_deleted' })
  readonly includeDeleted?: boolean;
}
