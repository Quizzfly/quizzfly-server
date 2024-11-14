import { BaseResDto } from '@common/dto/base.res.dto';
import { StringField } from '@core/decorators/field.decorators';

export class InfoGroupResDto extends BaseResDto {
  @StringField()
  name: string;

  @StringField()
  description: string;

  @StringField()
  background: string;
}
