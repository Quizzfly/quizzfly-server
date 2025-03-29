import { StringField } from '@core/decorators/field.decorators';
import { InfoGroupResDto } from '@modules/group/dto/response/info-group.res.dto';

export class InfoDetailGroupResDto extends InfoGroupResDto {
  @StringField()
  role: string;
}
