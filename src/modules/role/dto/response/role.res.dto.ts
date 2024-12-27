import { BaseResDto } from '@common/dto/base.res.dto';
import {
  ClassFieldOptional,
  StringField,
  StringFieldOptional,
  UUIDFieldOptional,
} from '@core/decorators/field.decorators';
import { PermissionResDto } from '@modules/permission/dto/response/permission.res.dto';
import { Expose, Transform } from 'class-transformer';

@Expose()
export class RoleResDto extends BaseResDto {
  @StringField()
  @Expose()
  name: string;

  @StringFieldOptional()
  @Expose()
  description?: string;

  @ClassFieldOptional(() => PermissionResDto, { isArray: true, each: true })
  @Expose()
  permissions?: PermissionResDto[];

  @UUIDFieldOptional({ each: true, uniqueItems: true })
  @Transform(({ obj }) =>
    obj.permissions && obj.permissions.length > 0
      ? obj.permissions.map((permission: PermissionResDto) => permission.id)
      : [],
  )
  @Expose()
  permission_ids: string[];
}
