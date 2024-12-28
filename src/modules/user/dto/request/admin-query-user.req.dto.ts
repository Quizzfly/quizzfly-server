import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import {
  BooleanFieldOptional,
  StringFieldOptional,
} from '@core/decorators/field.decorators';
import { IsArrayDistinct } from '@core/decorators/validators/is-array-disctinct.validator';
import { Expose, Transform } from 'class-transformer';

@Expose()
export class AdminQueryUserReqDto extends PageOptionsDto {
  @BooleanFieldOptional({ default: false, name: 'only_deleted' })
  @Expose({ name: 'only_deleted' })
  readonly onlyDeleted?: boolean;

  @StringFieldOptional({ each: true, uniqueItems: true })
  @IsArrayDistinct({ message: 'role name must contain unique values' })
  @Transform(({ obj }) =>
    obj.role && typeof obj.role === 'string' ? [obj.role] : obj.role,
  )
  role: Array<string>;
}
