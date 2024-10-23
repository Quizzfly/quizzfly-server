import { ClassFieldOptional } from '@core/decorators/field.decorators';
import { PrevElementDto } from '@modules/quiz/dto/prev-element.dto';
import { Expose } from 'class-transformer';

export class CreateSlideReqDto {
  @ClassFieldOptional(() => PrevElementDto, {
    name: 'prev_element',
    nullable: true,
  })
  @Expose({ name: 'prev_element' })
  prevElement?: PrevElementDto = null;
}
