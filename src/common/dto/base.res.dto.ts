import {
  ClassField,
  ClassFieldOptional,
  UUIDField,
} from '@core/decorators/field.decorators';

export class BaseResDto {
  @UUIDField()
  id: string;

  @ClassField(() => Date, { name: 'created_at' })
  createdAt: Date;

  @ClassField(() => Date, { name: 'updated_at' })
  updatedAt: Date;

  @ClassFieldOptional(() => Date, { name: 'deleted_at', example: null })
  deletedAt?: Date;
}
