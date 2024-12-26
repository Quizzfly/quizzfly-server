import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { Expose } from 'class-transformer';

@Expose()
export class RoleFilterDto extends PageOptionsDto {
  prepareCondition() {}
}
