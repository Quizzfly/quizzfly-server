import {
  ClassField,
  ClassFieldOptional,
  UUIDField,
} from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

export class BaseResDto {
  @UUIDField()
  @Expose()
  id: string;

  @ClassField(() => Date, { name: 'created_at' })
  @Expose({ name: 'created_at' })
  createdAt: Date;

  @ClassField(() => Date, { name: 'updated_at' })
  @Expose({ name: 'updated_at' })
  updatedAt: Date;

  @ClassFieldOptional(() => Date, { name: 'deleted_at', example: null })
  @Expose({ name: 'deleted_at' })
  deletedAt?: Date;
}
