import { BaseResDto } from '@common/dto/base.res.dto';
import {
  ClassFieldOptional,
  EnumField,
  StringField,
  UUIDField,
} from '@core/decorators/field.decorators';
import { FileResDto } from '@modules/file/dto/file.res.dto';
import { PostType } from '@modules/group/enums/post-type.enum';

export class InfoPostResDto extends BaseResDto {
  @EnumField(() => PostType, {
    name: 'type',
    example: Object.values(PostType).join(' | '),
  })
  type: PostType;

  @StringField()
  content: string;

  @ClassFieldOptional(() => FileResDto, { each: true, isArray: true })
  files?: Array<FileResDto>;

  @StringField()
  quizzflyId: string;

  @UUIDField({
    name: 'member_id',
  })
  memberId: string;
}
