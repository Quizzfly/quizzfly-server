import { BaseResDto } from '@common/dto/base.res.dto';
import {
  ClassFieldOptional,
  EnumField,
  NumberField,
  StringField,
} from '@core/decorators/field.decorators';
import { FileResDto } from '@modules/file/dto/file.res.dto';
import { PostType } from '@modules/group/enums/post-type.enum';
import { InfoDetailQuizzflyResDto } from '@modules/quizzfly/dto/response/info-detail-quizzfly.res';
import { UserInfoResDto } from '@modules/user/dto/response/user-info.res.dto';

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

  @ClassFieldOptional(() => InfoDetailQuizzflyResDto)
  quizzfly: InfoDetailQuizzflyResDto;

  @ClassFieldOptional(() => UserInfoResDto)
  member: UserInfoResDto;

  @NumberField()
  reactCount: number;
}
