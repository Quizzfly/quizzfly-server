import { Uuid } from '@common/types/common.type';
import {
  ClassFieldOptional,
  StringField,
  StringFieldOptional,
} from '@core/decorators/field.decorators';
import { FileReqDto } from '@modules/file/dto/file.req.dto';
import { PostType } from '@modules/group/enums/post-type.enum';
import { Expose } from 'class-transformer';

export class CreatePostReqDto {
  @StringField()
  type: PostType;

  @StringFieldOptional()
  content?: string;

  @StringFieldOptional({
    name: 'quizzfly_id',
  })
  @Expose({
    name: 'quizzfly_id',
  })
  quizzflyId?: Uuid;

  @ClassFieldOptional(() => FileReqDto, { each: true, isArray: true })
  files?: FileReqDto[];
}
