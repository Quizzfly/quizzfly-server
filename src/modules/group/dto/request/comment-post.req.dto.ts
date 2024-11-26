import { Uuid } from '@common/types/common.type';
import {
  ClassFieldOptional,
  StringFieldOptional,
  UUIDFieldOptional,
} from '@core/decorators/field.decorators';
import { FileReqDto } from '@modules/file/dto/file.req.dto';
import { Expose } from 'class-transformer';

export class CommentPostReqDto {
  @UUIDFieldOptional({
    name: 'parent_comment_id',
  })
  @Expose({
    name: 'parent_comment_id',
  })
  parentCommentId?: Uuid;

  @StringFieldOptional()
  content?: string;

  @ClassFieldOptional(() => FileReqDto, { each: true, isArray: true })
  files?: FileReqDto[];
}
