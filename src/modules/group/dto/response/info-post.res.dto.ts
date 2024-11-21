import { BaseResDto } from '@common/dto/base.res.dto';
import {
  ClassFieldOptional,
  StringField,
  UUIDField,
} from '@core/decorators/field.decorators';
import { FileResDto } from '@modules/file/dto/file.res.dto';

export class InfoPostResDto extends BaseResDto {
  @StringField()
  type: string;

  @StringField()
  content: string;

  @ClassFieldOptional(() => FileResDto, { each: true, isArray: true })
  files?: Array<FileResDto>;

  @StringField()
  quizzflyId: string;

  @UUIDField()
  memberId: string;
}
