import { BaseResDto } from '@common/dto/base.res.dto';
import {
  BooleanField,
  ClassFieldOptional,
  EnumField,
  NumberField,
  StringField,
} from '@core/decorators/field.decorators';
import { FileResDto } from '@modules/file/dto/file.res.dto';
import { PostType } from '@modules/group/enums/post-type.enum';
import { InfoDetailQuizzflyResDto } from '@modules/quizzfly/dto/response/info-detail-quizzfly.res';
import { UserInfoResDto } from '@modules/user/dto/response/user-info.res.dto';
import { Expose, Transform } from 'class-transformer';

@Expose({ toPlainOnly: true })
export class InfoPostResDto extends BaseResDto {
  @EnumField(() => PostType, {
    name: 'type',
    example: Object.values(PostType).join(' | '),
  })
  @Expose()
  type: PostType;

  @StringField()
  @Expose()
  content: string;

  @ClassFieldOptional(() => FileResDto, { each: true, isArray: true })
  @Expose()
  files?: Array<FileResDto>;

  @ClassFieldOptional(() => InfoDetailQuizzflyResDto)
  @Expose()
  @Transform(({ obj }) => {
    return obj.quizzflyId
      ? {
          id: obj.quizzflyId,
          title: obj.title,
          description: obj.description,
          coverImage: obj.coverImage,
          theme: obj.theme,
          isPublic: obj.isPublic,
          quizzflyStatus: obj.quizzflyStatus,
        }
      : null;
  })
  quizzfly: InfoDetailQuizzflyResDto;

  @ClassFieldOptional(() => UserInfoResDto)
  @Transform(({ obj }) => {
    const { member, memberId, username, avatar, name } = obj;

    if (member?.userInfo) {
      const { id } = member;
      const { username, avatar, name } = member.userInfo;
      return { id, username, avatar, name };
    }

    return memberId ? { id: memberId, username, avatar, name } : null;
  })
  @Expose()
  member: UserInfoResDto;

  @NumberField()
  @Expose()
  reactCount: number;

  @NumberField()
  @Expose()
  commentCount: number;

  @BooleanField()
  @Expose()
  isLiked: boolean;
}
