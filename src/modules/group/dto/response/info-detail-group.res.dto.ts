import { InfoGroupResDto } from '@modules/group/dto/response/info-group.res.dto';
import { StringField } from '@core/decorators/field.decorators';

export class InfoDetailGroupResDto extends InfoGroupResDto {

  @StringField()
  role: string;
}
