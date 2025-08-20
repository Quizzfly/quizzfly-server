import { Uuid } from '@/common/types/common.type';
import { UUIDFieldOptional } from '@/core/decorators/field.decorators';

export class ReorderFlashcardDto {
  @UUIDFieldOptional()
  previous_id: Uuid;

  @UUIDFieldOptional()
  next_id: Uuid;
}
