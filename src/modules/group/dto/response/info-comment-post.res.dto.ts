import { BaseResDto } from '@common/dto/base.res.dto';
import { Uuid } from '@common/types/common.type';
import {
  ClassFieldOptional,
  StringField,
  UUIDField,
} from '@core/decorators/field.decorators';
import { FileResDto } from '@modules/file/dto/file.res.dto';

export class InfoCommentPostResDto extends BaseResDto {
  @StringField()
  content: string;

  @ClassFieldOptional(() => FileResDto, { each: true, isArray: true })
  files?: Array<FileResDto>;

  @UUIDField({
    name: 'member_id',
  })
  memberId: Uuid;

  @UUIDField({
    name: 'parent_comment_id',
  })
  parentCommentId: Uuid;
}
