import {
  ClassField,
  ClassFieldOptional,
  UUIDField,
} from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

@Expose()
export class BaseResDto {
  @UUIDField()
  @Expose()
  id: string;

  @ClassField(() => Date, { name: 'created_at' })
  @Expose()
  createdAt: Date;

  @ClassField(() => Date, { name: 'updated_at' })
  @Expose()
  updatedAt: Date;

  @ClassFieldOptional(() => Date, { name: 'deleted_at', example: null })
  @Expose()
  deletedAt?: Date;
}
