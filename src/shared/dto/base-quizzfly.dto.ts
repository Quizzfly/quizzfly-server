import { Uuid } from '@common/types/common.type';
import { UUIDField } from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

@Expose()
export class BaseQuizzflyDto {
  @UUIDField()
  @Expose()
  id: Uuid;

  @UUIDField()
  @Expose()
  title: string;
}
