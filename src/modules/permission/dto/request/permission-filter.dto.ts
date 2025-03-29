import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { ResourceList } from '@core/constants/app.constant';
import { EnumFieldOptional } from '@core/decorators/field.decorators';
import { IsArrayDistinct } from '@core/decorators/validators/is-array-disctinct.validator';
import { Expose, Transform } from 'class-transformer';

@Expose()
export class PermissionFilterDto extends PageOptionsDto {
  @EnumFieldOptional(() => ResourceList, { each: true, isArray: true })
  @IsArrayDistinct({ message: 'resource key must contain unique values' })
  @Transform(({ obj }) => {
    return obj.resource && typeof obj.resource === 'string'
      ? [obj.resource]
      : obj.resource;
  })
  @Expose()
  resource?: ResourceList[];
}
