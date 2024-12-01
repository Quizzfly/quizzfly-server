import { BaseResDto } from '@common/dto/base.res.dto';
import { Uuid } from '@common/types/common.type';
import {
  ClassFieldOptional,
  NumberFieldOptional,
  StringField,
  UUIDField,
} from '@core/decorators/field.decorators';
import { FileResDto } from '@modules/file/dto/file.res.dto';
import { UserInfoResDto } from '@modules/user/dto/response/user-info.res.dto';
import { Exclude, Expose, Transform } from 'class-transformer';

@Expose({ toPlainOnly: true })
@Exclude()
export class InfoCommentPostResDto extends BaseResDto {
  @StringField()
  @Expose()
  content: string;

  @ClassFieldOptional(() => FileResDto, { each: true, isArray: true })
  @Expose()
  files?: Array<FileResDto>;

  @ClassFieldOptional(() => UserInfoResDto)
  @Expose()
  @Transform(({ obj }) => {
    return obj.memberId
      ? {
          id: obj.memberId,
          username: obj.username,
          avatar: obj.avatar,
          name: obj.name,
        }
      : null;
  })
  member: UserInfoResDto;

  @UUIDField({
    name: 'parent_comment_id',
  })
  @Expose()
  parentCommentId: Uuid;

  @NumberFieldOptional({
    name: 'count_replies',
  })
  @Expose()
  countReplies: number;
}
