import { Uuid } from '@common/types/common.type';
import {
  EnumFieldOptional,
  UUIDFieldOptional,
} from '@core/decorators/field.decorators';
import { PrevElementType } from '@modules/quiz/enums/prev-element-type.enum';
import { Expose } from 'class-transformer';

export class PrevElementDto {
  @UUIDFieldOptional({ nullable: true })
  id?: Uuid = null;

  @EnumFieldOptional(() => PrevElementType, {
    name: 'element_type',
    example: Object.values(PrevElementType).join(' | '),
  })
  @Expose({ name: 'element_type' })
  elementType?: PrevElementType = null;
}
